import { readFile } from 'node:fs/promises'

export async function loadLocalEnv() {
  try {
    const raw = await readFile(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const separator = trimmed.indexOf('=')
      if (separator === -1) continue
      const key = trimmed.slice(0, separator).trim()
      const value = trimmed.slice(separator + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // .env.local is optional when environment variables are provided by Vercel.
  }
}
