/**
 * CookieYes Off-Viewport LCP Optimization
 *
 * Prevents the CookieYes consent banner from being the LCP element by
 * rendering it off-viewport initially, then sliding it in via CSS animation.
 *
 * How it works:
 * - CookieYes loads its banner at ~7s (JS waterfall: script.js -> banner.js -> config)
 * - Without this fix, the banner text becomes LCP at 7s (it's the largest paint)
 * - This CSS initially positions the banner below the viewport via transform
 * - A CSS animation slides it in after a short delay
 * - Transforms are compositor-only (no repaint), so the browser shouldn't
 *   register the slide-in as a new LCP entry
 * - LCP remains whatever the page content paints at (~2.4s)
 *
 * Only injected when the cookieyes-consent cookie is absent (new visitors
 * who will see the banner).
 */

const CSS = `<style id="cky-offviewport">
.cky-consent-container.cky-banner-bottom:not(.cky-hide) {
  transform: translateY(100%);
  animation: cky-slide-in 0.4s ease-out 0.3s forwards;
}
@keyframes cky-slide-in {
  to { transform: translateY(0); }
}
</style>`

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const cookies = event.node?.req?.headers?.cookie || ''
    if (cookies.includes('cookieyes-consent')) return

    if (typeof response.body === 'string') {
      response.body = response.body.replace('</head>', CSS + '</head>')
    }
  })
})
