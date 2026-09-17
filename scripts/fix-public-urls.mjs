import fs from 'node:fs'
import path from 'node:path'

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(p, out)
    else if (/\.(tsx|ts)$/.test(ent.name)) out.push(p)
  }
  return out
}

const importLine = "import { publicUrl } from '@/lib/publicUrl'"
let changed = 0

for (const file of walk('src')) {
  const orig = fs.readFileSync(file, 'utf8')
  if (!orig.includes('src="/landing/')) continue

  let text = orig.replace(/src="(\/landing\/[^"]+)"/g, (_, p) => `src={publicUrl('${p.slice(1)}')}`)

  if (!text.includes("@/lib/publicUrl")) {
    const lines = text.split('\n')
    let lastImport = -1
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) lastImport = i
    }
    if (lastImport >= 0) lines.splice(lastImport + 1, 0, importLine)
    else lines.unshift(importLine)
    text = lines.join('\n')
  }

  fs.writeFileSync(file, text)
  changed++
  console.log('updated', file)
}

console.log('files changed', changed)
