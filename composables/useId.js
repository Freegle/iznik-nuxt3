let id = 0

export function uid(type) {
  return type + id++
}
