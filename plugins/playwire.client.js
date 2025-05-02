// We want to register a page via to Playwire when we render a new page.  Suppress the first one as loading
// the Playwire script in OurPlaywireDa will trigger a page view.

let loaded = false
export default defineNuxtPlugin((nuxtApp) => {
  useRuntimeHook('page:finish', () => {
    if (loaded) {
      if (window.PageOS && window.PageOS.session) {
        try {
          console.log('Record new page view in Playwire')
          window.PageOS.session.newPageView()
        } catch (e) {
          console.log('PageOS session newPageView failed', e)
        }
      }
    }

    loaded = true
  })
})
