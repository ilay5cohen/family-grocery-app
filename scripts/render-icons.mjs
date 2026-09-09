// Renders the PWA raster icons from the SVG sources in public/.
// Run with: npm run icons
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

const jobs = [
  { src: 'icon-512.svg', out: 'icon-512.png', size: 512 },
  { src: 'icon-512.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon-maskable-512.svg', out: 'icon-maskable-512.png', size: 512 },
  // iOS ignores SVG for apple-touch-icon and never renders transparency.
  { src: 'icon-512.svg', out: 'apple-touch-icon.png', size: 180, flatten: '#047857' },
]

for (const job of jobs) {
  const svg = await readFile(path.join(publicDir, job.src))
  let pipeline = sharp(svg, { density: 384 }).resize(job.size, job.size)
  if (job.flatten) pipeline = pipeline.flatten({ background: job.flatten })
  const png = await pipeline.png({ compressionLevel: 9 }).toBuffer()
  await writeFile(path.join(publicDir, job.out), png)
  console.log(`${job.out.padEnd(26)} ${job.size}x${job.size}  ${(png.length / 1024).toFixed(1)} KB`)
}
