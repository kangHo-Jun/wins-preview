import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
for(const file of ['dist/app.js','dist/report.js','dist/jszip.min.js','scripts/serve.mjs']) {
  const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
  if(result.status!==0) throw new Error(`${file}: ${result.stderr}`);
}
const html=await fs.readFile(path.join(root,'dist/index.html'),'utf8');
const sources=[...html.matchAll(/(?:src|href)="(\.\/[^"?#]+)(?:[?#][^"]*)?"/g)].map(m=>m[1]);
for(const source of sources) await fs.access(path.join(root,'dist',source));
const js=(await fs.readFile(path.join(root,'dist/app.js'),'utf8'))+(await fs.readFile(path.join(root,'dist/report.js'),'utf8'));
for(const source of [...js.matchAll(/src="\.\/([^"?#]+\.(?:png|jpg|svg))"/g)].map(m=>m[1])) await fs.access(path.join(root,'dist',source));
for(const file of ['package.json','package-lock.json','.openai/hosting.json']) JSON.parse(await fs.readFile(path.join(root,file),'utf8'));
console.log('PASS: JavaScript syntax, HTML assets, referenced images and configuration JSON.');
console.log('Buildless app: dist/ is the complete deployable application; no compiler or network dependency is required.');
