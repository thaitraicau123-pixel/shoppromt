"""
api/ai.py
Vercel Python Serverless Function — "AI Prompt Studio" chạy qua Respan Gateway.

Người mua đã mở khóa một Hộp Công Cụ Prompts có thể nhờ AI viết lại Master Prompt
cho đúng dự án của mình (ngành, kênh, phong cách...). Mọi lệnh gọi model đi qua
respan-gateway chạy in-process, dùng chính key nhà cung cấp của dự án, nên khi cần
đổi nhà cung cấp chỉ phải đổi GATEWAY_MODEL — client không phải sửa gì.

Cấu hình (Vercel → Settings → Environment Variables, hoặc .env.local):
  OPENAI_API_KEY / ANTHROPIC_API_KEY / GEMINI_API_KEY — key nhà cung cấp cho gateway
  GATEWAY_MODEL        — tuỳ chọn, mặc định gpt-4o-mini (đặt claude-* / gemini-* để đổi route)
  FIREBASE_WEB_API_KEY — API key web công khai của Firebase, dùng xác thực ID token

Kiểm thử cục bộ: python3 test/respan-gateway.test.py
"""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler
from urllib import error, request

MAX_PROMPT_CHARS = 12000
MAX_CONTEXT_CHARS = 1000
MAX_BODY_BYTES = 64 * 1024
DEFAULT_MODEL = "gpt-4o-mini"
DEFAULT_PROJECT = "promtmmo"

SYSTEM_INSTRUCTION = (
    "Bạn là biên tập viên prompt của PromptMMO Studio (Bùi Thái AI Studio). "
    "Người mua đã trả Xu để lấy một Master Prompt; nhiệm vụ của bạn là viết lại prompt đó "
    "cho khớp đúng dự án của họ.\n"
    "- Giữ nguyên cấu trúc, thứ tự phần và MỌI ràng buộc của prompt gốc.\n"
    "- Chỉ thay thế / bổ sung phần bối cảnh, đối tượng, kênh, phong cách, ví dụ cho khớp mô tả của người dùng.\n"
    "- Không bịa số liệu, không thêm liên kết, không hứa hẹn kết quả, không rút gọn thành dàn ý.\n"
    "- Viết bằng cùng ngôn ngữ với prompt gốc.\n"
    "- Trả về DUY NHẤT nội dung prompt đã hoàn thiện, không lời dẫn, không bọc trong ```."
)


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict) -> None:
    raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(raw)))
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(raw)


def _bearer_token(handler: BaseHTTPRequestHandler) -> str:
    raw = str(handler.headers.get("authorization") or "").strip()
    if raw.lower().startswith("bearer "):
        return raw[7:].strip()
    return ""


def _lookup_firebase_user(id_token: str) -> dict | None:
    """Xác thực Firebase ID token bằng Identity Toolkit (API key web là key công khai)."""
    api_key = os.environ.get("FIREBASE_WEB_API_KEY", "").strip()
    if not api_key or not id_token:
        return None

    url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + api_key
    req = request.Request(
        url,
        data=json.dumps({"idToken": id_token}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=8) as res:
            data = json.loads(res.read() or b"{}")
    except (error.HTTPError, error.URLError, TimeoutError, ValueError, OSError):
        return None

    users = data.get("users") if isinstance(data, dict) else None
    if not users:
        return None
    user = users[0] or {}
    return {"uid": str(user.get("localId") or ""), "email": str(user.get("email") or "")}


def _gateway_model() -> str:
    return (os.environ.get("GATEWAY_MODEL") or DEFAULT_MODEL).strip() or DEFAULT_MODEL


def _enhance_prompt(prompt: str, context: str, product_name: str) -> tuple[str, str]:
    """Gọi model qua respan-gateway in-process và trả về (prompt mới, model đã dùng)."""
    import respan_gateway as rg

    model = _gateway_model()
    lines = [
        "Prompt gốc cần viết lại:",
        "<<<PROMPT",
        prompt,
        "PROMPT",
    ]
    if product_name:
        lines += ["", "Sản phẩm người mua đang dùng: " + product_name]
    lines += [
        "",
        "Dự án của người dùng:",
        context.strip() or "Không nêu cụ thể — hãy viết lại cho rõ ràng, dễ tái sử dụng nhưng vẫn giữ nguyên khung.",
    ]

    with rg.Gateway() as gw:
        client = gw.openai()
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_INSTRUCTION},
                {"role": "user", "content": "\n".join(lines)},
            ],
            temperature=0.4,
        )

    choices = getattr(completion, "choices", None) or []
    if not choices:
        raise RuntimeError("gateway_empty_completion")
    text = (choices[0].message.content or "").strip()
    if not text:
        raise RuntimeError("gateway_empty_completion")
    if text.startswith("```") and text.endswith("```"):
        text = text.strip("`").strip()
        if "\n" in text:
            text = text.split("\n", 1)[1].strip()
    return text, model


class handler(BaseHTTPRequestHandler):
    server_version = "PromptMMO-AI/1.0"

    def log_message(self, fmt: str, *args) -> None:  # giữ log Vercel gọn
        print("[api/ai] " + (fmt % args))

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_POST(self) -> None:  # noqa: N802
        user = _lookup_firebase_user(_bearer_token(self))
        if not user:
            _json_response(self, 401, {
                "ok": False,
                "code": "unauthorized",
                "message": "Vui lòng đăng nhập lại để dùng trợ lý AI.",
            })
            return

        try:
            length = int(self.headers.get("content-length") or 0)
        except ValueError:
            length = 0
        if length <= 0 or length > MAX_BODY_BYTES:
            _json_response(self, 400, {"ok": False, "code": "bad_body", "message": "Dữ liệu gửi lên không hợp lệ."})
            return

        try:
            body = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            _json_response(self, 400, {"ok": False, "code": "bad_json", "message": "Dữ liệu gửi lên không phải JSON."})
            return

        prompt = str((body or {}).get("prompt") or "").strip()
        context = str((body or {}).get("context") or "").strip()
        product_name = str((body or {}).get("productName") or "").strip()[:200]

        if not prompt:
            _json_response(self, 400, {"ok": False, "code": "missing_prompt", "message": "Thiếu nội dung prompt cần tối ưu."})
            return
        if len(prompt) > MAX_PROMPT_CHARS:
            _json_response(self, 400, {"ok": False, "code": "prompt_too_long", "message": f"Prompt dài quá {MAX_PROMPT_CHARS} ký tự."})
            return
        if len(context) > MAX_CONTEXT_CHARS:
            _json_response(self, 400, {"ok": False, "code": "context_too_long", "message": f"Mô tả dự án dài quá {MAX_CONTEXT_CHARS} ký tự."})
            return

        try:
            text, model = _enhance_prompt(prompt, context, product_name)
        except ImportError:
            _json_response(self, 503, {
                "ok": False,
                "code": "gateway_missing",
                "message": "Máy chủ chưa cài respan-gateway. Chạy: pip install -r requirements.txt",
            })
            return
        except Exception as err:  # GatewayError, ConfigError, lỗi mạng provider...
            print("[api/ai] gateway error:", type(err).__name__, err)
            _json_response(self, 502, {
                "ok": False,
                "code": "gateway_failed",
                "message": "Trợ lý AI đang bận hoặc chưa cấu hình key nhà cung cấp. Vui lòng thử lại sau ít phút.",
            })
            return

        _json_response(self, 200, {
            "ok": True,
            "prompt": text,
            "model": model,
            "project": os.environ.get("FIREBASE_PROJECT_ID", DEFAULT_PROJECT),
        })
