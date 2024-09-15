import pluralize from 'pluralize'

export function withplural(word, count, withnumber) {
  if (Array.isArray(word)) {
    let rv = withnumber ? count + ' ' : ''
    return rv + ((count === 1) ? word[0] : word[1])
  }
  return pluralize(word, count, withnumber)
}

