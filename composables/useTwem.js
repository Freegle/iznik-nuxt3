import twemoji from 'vue-twemoji'

export function twem(msg) {
  if (typeof msg === 'number') {
    // This can happen if people post just numeric values.
    msg += ''
  }

  if (typeof msg === 'string') {
    msg = msg.replace(
      /\\\\u(.*?)\\\\u/g,
      function (match, contents, offset, s) {
        s = contents.split('-')

        let ret = ''

        for (const t of s) {
          ret += twemoji.convert.fromCodePoint(t)
        }

        return ret
      }
    )
  }

  return msg
}

export function untwem(msg) {
  msg = twemoji.replace(msg, function (emoji) {
    return '\\\\u' + twemoji.convert.toCodePoint(emoji) + '\\\\u'
  })

  return msg
}
