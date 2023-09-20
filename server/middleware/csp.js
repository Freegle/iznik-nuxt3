// CSP.  See also _hedaers.
export default defineEventHandler((event) => {
  event.node.res.setHeader(
    'Content-Security-Policy',
    "object-src 'none'; worker-src blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.facebook.net *.facebook.com ilovefreegle.matomo.cloud *.sentry.io *.google.com *.googletagservices.com *.gstatic.com cdn.jsdelivr.net *.paypalobjects.com securepubads.g.doubleclick.net *.googlesyndication.com *.netlify.app; report-uri https://fdapilive.ilovefreegle.org/csp.php"
  )
})
