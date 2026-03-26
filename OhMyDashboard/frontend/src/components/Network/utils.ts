export const fmt = (b: number) => {
  if (b === 0) return '0 B'
  const k = 1024
  const s = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}

export const fmtS = (b: number) => {
  if (b === 0) return '0 B/s'
  const k = 1024
  const s = ['B/s', 'KB/s', 'MB/s', 'GB/s']
  const i = Math.floor(Math.log(b) / Math.log(k))
  return `${(b / Math.pow(k, i)).toFixed(1)} ${s[i]}`
}
