export function toCsv(rows = [], columns = []) {
  const header = columns.map((column) => escapeCsv(column.header)).join(',')
  const body = rows.map((row) => (
    columns.map((column) => escapeCsv(resolveValue(row, column.key))).join(',')
  ))
  return [header, ...body].join('\n')
}

export function downloadCsv(filename, rows, columns) {
  const csv = toCsv(rows, columns)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function resolveValue(row, key) {
  return String(key)
    .split('.')
    .reduce((value, part) => value?.[part], row) ?? ''
}

function escapeCsv(value) {
  const stringValue = String(value ?? '')
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}
