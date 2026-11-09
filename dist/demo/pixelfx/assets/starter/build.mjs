import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {dirname,resolve} from 'node:path';
const root=dirname(fileURLToPath(import.meta.url));
const esbuild=await import(process.env.PIXELFX_ESBUILD_MODULE?pathToFileURL(resolve(process.env.PIXELFX_ESBUILD_MODULE)).href:'esbuild');
const result=await esbuild.build({absWorkingDir:root,entryPoints:['game.js'],bundle:true,write:false,format:'iife',minify:true,legalComments:'inline',target:'es2020'});
const license=readFileSync(resolve(root,'LICENSE-PixelFX.txt'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8').replace('<!-- GAME_BUNDLE -->',`<!-- PixelFX license\n${license}\nHollow Crown act/rig: Copyright (c) 2026 rehan-remade, MIT. Audio excerpts: user-provided reference files. -->\n<script>${result.outputFiles[0].text.replaceAll('</script','<\\/script')}</script>`);
mkdirSync(resolve(root,'dist'),{recursive:true});writeFileSync(resolve(root,'dist/Ember-Vault-Impact.html'),html);console.log('Built offline HTML',Buffer.byteLength(html));
