// CSP.  See also _headers.
export default defineEventHandler((event) => {
  // Disabled because we show ads which come in from a variety of domains.
  // event.node.res.setHeader(
  //   'Content-Security-Policy',
  //   "object-src 'none'; worker-src blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.facebook.net *.facebook.com matomo.ilovefreegle.org *.sentry.io *.google.com *.googletagservices.com *.gstatic.com accounts.google.com/gsi/client cdn.jsdelivr.net *.paypalobjects.com googleads.g.doubleclick.net *.gumgum.com *.adnxs.com securepubads.g.doubleclick.net *.googlesyndication.com *.netlify.app cdn-cookieyes.com api.rlcdn.com ads.pubmatic.com; report-uri https://fdapilive.ilovefreegle.org/csp.php"
  // )
})
