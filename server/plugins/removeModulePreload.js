export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    // Remove from html.head any lines of <link rel="modulepreload" ...>
    console.log('Remove modulepreload')
    html.head = html.head.filter(
      (line) => !line.startsWith('<link rel="modulepreload"')
    )
  })
})
