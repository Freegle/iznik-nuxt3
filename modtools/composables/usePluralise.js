// Replacement for pluralize which wasn't much good as a helper

export function pluralise(word, count, withnumber) {
  const rv = withnumber ? count + ' ' : ''
  if (Array.isArray(word)) {
    return rv + (count === 1 ? word[0] : word[1])
  }
  return rv + (count === 1 ? word : word + 's')
}
