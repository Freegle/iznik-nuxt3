export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    const regex =
      /<script [\s\w"/=-]* src="\/_nuxt\/entry.\w*.js" [\s\w"/=-]*><\/script>/

    const head = html.head[0]
    const bodyAppend = html.bodyAppend[0]
    const script = head.match(regex)

    if (script === null) {
      throw new Error('Could not find JS entry point in build manifest head')
    } else {
      html.head[0] = head.replace(script[0], '')
      html.bodyAppend[0] = bodyAppend + script[0]
    }
  })
})
