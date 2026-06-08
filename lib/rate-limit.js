const windows = new Map()

export function rateLimit({ key, windowMs = 60000, maxRequests = 5 }) {
  const now = Date.now()
  const record = windows.get(key) || { timestamps: [] }

  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs)

  if (record.timestamps.length >= maxRequests) {
    return {
      allowed: false,
      retryAfter: Math.ceil(
        (record.timestamps[0] + windowMs - now) / 1000,
      ),
    }
  }

  record.timestamps.push(now)
  windows.set(key, record)

  if (windows.size > 10000) {
    for (const [k, v] of windows) {
      if (!v.timestamps.length) windows.delete(k)
    }
  }

  return { allowed: true }
}
