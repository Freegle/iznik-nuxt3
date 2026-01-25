// Replacement for pluralize which wasn't much good as a helper

export function pluralise(word, count, withnumber) {
  let rv = withnumber ? count + ' ' : ''
  if (rv.length > 4) {
    rv = rv.substring(0, rv.length - 4) + ',' + rv.substring(rv.length - 4)
  }
  if (Array.isArray(word)) {
    return rv + (count === 1 ? word[0] : word[1])
  }
  return rv + (count === 1 ? word : word + 's')
}
