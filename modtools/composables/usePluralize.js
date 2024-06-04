import pluralize from 'pluralize'

export function withplural(a, b, c) {
  if (Array.isArray(a)) {
    // Don't use addIrregularRule which converts to lower-case
    pluralize.addPluralRule(a[0], a[1])
    a = a[1]
  }
  return pluralize(a, b, c)
}

