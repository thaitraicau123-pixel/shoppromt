/**
 * test/verify-bugs-1-and-2.test.mjs
 *
 * Automated regression test suite verifying:
 * (1) Balance does not revert back when syncTopupsFromCloud runs after spending
 * (2) Orders are permanently retained in localStorage ('shopviet_orders') across reloads and cache bumps
 * (3) Static code safety checks (no destructive removeItem for orders/topups, no flawed balance revert logic)
 */

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createMockEnvironment, loadStateInstance } from './test-helper.mjs';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const STATE_JS_PATH = path.join(ROOT_DIR, 'js', 'state.js');
const INDEX_HTML_PATH = path.join(ROOT_DIR, 'index.html');

console.log(`[TEST SUITE] Running verification on: ${ROOT_DIR}`);

/* =========================================================================
 * 1. STATIC CODE SAFETY AUDIT
 * ========================================================================= */
console.log('\n--- 1. Static Code Safety Audit ---');

const indexHtmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const stateJsContent = fs.readFileSync(STATE_JS_PATH, 'utf8');

// Ensure destructive removeItem is NOT in index.html
assert.ok(
  !indexHtmlContent.includes("localStorage.removeItem('shopviet_orders')"),
  'FAIL: index.html must NOT wipe shopviet_orders on version upgrade'
);
assert.ok(
  !indexHtmlContent.includes("localStorage.removeItem('shopviet_topups')"),
  'FAIL: index.html must NOT wipe shopviet_topups on version upgrade'
);
console.log('PASS: index.html does not remove shopviet_orders or shopviet_topups');

// Ensure flawed balance reset logic is NOT in state.js
assert.ok(
  !stateJsContent.includes('curLocalBal === 0 && newlyCreditedAmount < totalCompletedSum'),
  'FAIL: state.js must NOT reset targetBalance = totalCompletedSum when balance hits 0'
);
console.log('PASS: state.js does not contain flawed balance-revert conditional');

// Ensure getSpentCoins exists and is utilized
assert.ok(
  stateJsContent.includes('getSpentCoins: function'),
  'FAIL: state.js must define getSpentCoins to track spent balance'
);
console.log('PASS: state.js contains getSpentCoins tracking logic');


/* =========================================================================
 * 2. BUG 1 VERIFICATION: Balance does NOT revert after spending
 * ========================================================================= */
console.log('\n--- 2. Bug 1: Topup + Purchase + Cloud Sync Verification ---');

// Test Case 2.1: Full spend to 0 Xu, then syncTopupsFromCloud runs
{
  const mockEnv = createMockEnvironment();
  const state = loadStateInstance(STATE_JS_PATH, mockEnv);

  const testEmail = 'customer_alpha@promptmmo.com';
  state.state.user = {
    id: 'usr_alpha',
    name: 'Customer Alpha',
    email: testEmail,
    role: 'user',
    balance: 0,
    isLoggedIn: true
  };
  state.save();

  // Topup 50,000 Xu available in Cloud
  const topup1 = {
    id: 'topup_50k_001',
    userEmail: testEmail,
    amount: 50000,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  mockEnv.mockWindow.setCloudTopups([topup1]);
  await state.syncTopupsFromCloud();
  assert.equal(state.state.user.balance, 50000, 'User balance should be 50,000 Xu after first topup');
  console.log('PASS 2.1.a: Initial deposit credited 50,000 Xu');

  // Customer purchases product costing 50,000 Xu
  const deductRes = state.deductUserCoins(testEmail, 50000, { productId: 'prod_course_1' });
  assert.equal(deductRes.success, true, 'Deduction of 50,000 Xu should succeed');
  assert.equal(state.state.user.balance, 0, 'User balance must be 0 Xu after purchase');

  state.addOrder({
    id: 'ord_50k_001',
    orderCode: 'ORD-50K-001',
    userEmail: testEmail,
    amount: 50000,
    productId: 'prod_course_1',
    productName: 'Mastering AI Course',
    status: 'completed',
    createdAt: new Date().toISOString()
  });

  const spentRecorded = state.getSpentCoins(testEmail);
  assert.equal(spentRecorded, 50000, 'Spent coins should be recorded as 50,000 Xu');
  console.log('PASS 2.1.b: Purchase completed, balance reduced to 0 Xu, spent tracked: 50,000 Xu');

  // Cloud sync runs again (simulate background sync, F5 reload, or heartbeat)
  await state.syncTopupsFromCloud();
  assert.equal(
    state.state.user.balance,
    0,
    'CRITICAL: User balance MUST REMAIN 0 Xu and NOT revert to 50,000 Xu!'
  );
  console.log('PASS 2.1.c: syncTopupsFromCloud did NOT revert spent balance back to 50,000 Xu (Balance remains 0 Xu)');
}

// Test Case 2.2: Partial spend (deposit 100k, spend 40k -> 60k remaining)
{
  const mockEnv = createMockEnvironment();
  const state = loadStateInstance(STATE_JS_PATH, mockEnv);

  const testEmail = 'customer_partial@promptmmo.com';
  state.state.user = {
    id: 'usr_partial',
    name: 'Customer Partial',
    email: testEmail,
    role: 'user',
    balance: 0,
    isLoggedIn: true
  };
  state.save();

  const topup100k = {
    id: 'topup_100k_002',
    userEmail: testEmail,
    amount: 100000,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  mockEnv.mockWindow.setCloudTopups([topup100k]);
  await state.syncTopupsFromCloud();
  assert.equal(state.state.user.balance, 100000, 'User balance should be 100,000 Xu');

  // Spend 40,000 Xu
  state.deductUserCoins(testEmail, 40000);
  state.addOrder({
    id: 'ord_partial_002',
    userEmail: testEmail,
    amount: 40000,
    productId: 'prod_partial_item',
    status: 'completed'
  });

  assert.equal(state.state.user.balance, 60000, 'Balance must be 60,000 Xu after 40,000 Xu deduction');

  // Sync again
  await state.syncTopupsFromCloud();
  assert.equal(
    state.state.user.balance,
    60000,
    'Balance must remain 60,000 Xu and not revert to 100,000 Xu'
  );
  console.log('PASS 2.2: Partial spending retains exact remaining balance (60,000 Xu) after sync');
}

// Test Case 2.3: Second deposit after spending all previous funds
{
  const mockEnv = createMockEnvironment();
  const state = loadStateInstance(STATE_JS_PATH, mockEnv);

  const testEmail = 'customer_multi@promptmmo.com';
  state.state.user = {
    id: 'usr_multi',
    email: testEmail,
    balance: 0,
    isLoggedIn: true
  };
  state.save();

  const topupA = { id: 'topup_A', userEmail: testEmail, amount: 30000, status: 'completed' };
  mockEnv.mockWindow.setCloudTopups([topupA]);
  await state.syncTopupsFromCloud();
  assert.equal(state.state.user.balance, 30000);

  // Spend all 30k
  state.deductUserCoins(testEmail, 30000);
  state.addOrder({ id: 'ord_A', userEmail: testEmail, amount: 30000, productId: 'prod_A', status: 'completed' });
  assert.equal(state.state.user.balance, 0);

  // New deposit arrives in Cloud: 20k
  const topupB = { id: 'topup_B', userEmail: testEmail, amount: 20000, status: 'completed' };
  mockEnv.mockWindow.setCloudTopups([topupA, topupB]);
  await state.syncTopupsFromCloud();

  // Balance should now be exactly 0 + 20,000 = 20,000 (NOT 30k + 20k = 50k)
  assert.equal(
    state.state.user.balance,
    20000,
    'Balance after new deposit should be 20,000 Xu, not 50,000 Xu'
  );
  console.log('PASS 2.3: Subsequent topup after spending computes exact delta: 20,000 Xu');
}


/* =========================================================================
 * 3. BUG 2 VERIFICATION: Orders Permanently Retained Across Reloads & Cache Bumps
 * ========================================================================= */
console.log('\n--- 3. Bug 2: Orders Retention Across Reloads & Cache Bumps ---');

// Test Case 3.1: Order persistence to localStorage
{
  const sharedStorage = new Map();
  const mockEnv1 = createMockEnvironment(sharedStorage);
  const state1 = loadStateInstance(STATE_JS_PATH, mockEnv1);

  const testEmail = 'buyer@promptmmo.com';
  const orderData = {
    id: 'ord_persistent_999',
    orderCode: 'ORD-P-999',
    userEmail: testEmail,
    customer: { email: testEmail, name: 'Buyer' },
    productId: 'prod_gemini_elite',
    productName: 'PromptMMO Gemini Elite',
    amount: 75000,
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  state1.addOrder(orderData);

  // Verify in-memory state
  assert.ok(state1.state.orders.some(o => (o.id === 'ord_persistent_999' || o.orderCode === 'ORD-P-999')));

  // Verify dedicated localStorage key 'shopviet_orders'
  const rawOrders = mockEnv1.mockLocalStorage.getItem('shopviet_orders');
  assert.ok(rawOrders, "localStorage key 'shopviet_orders' must exist and have content");
  const parsedOrders = JSON.parse(rawOrders);
  assert.ok(Array.isArray(parsedOrders) && parsedOrders.length > 0);
  assert.equal(parsedOrders[0].id, 'ord_persistent_999');
  console.log("PASS 3.1: Order successfully persisted into localStorage 'shopviet_orders'");

  // Test Case 3.2: Simulate fresh page reload
  const mockEnv2 = createMockEnvironment(sharedStorage);
  const state2 = loadStateInstance(STATE_JS_PATH, mockEnv2);

  const ordersAfterReload = state2.getOrders();
  const foundOrder = ordersAfterReload.find(o => o.id === 'ord_persistent_999' || o.orderCode === 'ORD-P-999');
  assert.ok(foundOrder, 'Order must be retained after simulated page reload');
  assert.equal(foundOrder.productId, 'prod_gemini_elite');

  // Check getActiveProductOrder
  const activeOrder = state2.getActiveProductOrder('prod_gemini_elite', testEmail);
  assert.ok(activeOrder, 'getActiveProductOrder must find completed order across reloads');
  assert.equal(activeOrder.id, 'ord_persistent_999');
  console.log('PASS 3.2: Orders and getActiveProductOrder successfully recovered upon page reload');

  // Test Case 3.3: Simulate version upgrade cache bump
  // Wipe general app state cache key, but keep shopviet_orders intact (as fixed in index.html)
  for (const key of sharedStorage.keys()) {
    if (key.startsWith('shopviet247_app_state') || key === 'shopviet_custom_products') {
      sharedStorage.delete(key);
    }
  }

  const mockEnv3 = createMockEnvironment(sharedStorage);
  const state3 = loadStateInstance(STATE_JS_PATH, mockEnv3);

  const ordersAfterCacheBump = state3.getOrders();
  const foundAfterBump = ordersAfterCacheBump.find(o => o.id === 'ord_persistent_999');
  assert.ok(foundAfterBump, 'Order must survive cache bump and app state key eviction');
  console.log('PASS 3.3: Orders permanently retained across version bump and state cache eviction');

  // Test Case 3.4: Order Deduplication
  // If state.orders and localStorage both contain the order, getOrders must not duplicate it
  state3.state.orders = [orderData, orderData];
  const dedupedOrders = state3.getOrders();
  const matchCount = dedupedOrders.filter(o => o.id === 'ord_persistent_999').length;
  assert.equal(matchCount, 1, 'Orders must be cleanly deduplicated by ID');
  console.log('PASS 3.4: Orders deduplicated properly without duplicates');
}

console.log('\n======================================================');
console.log('ALL VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)');
console.log('======================================================\n');
