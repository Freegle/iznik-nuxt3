// CSP.  See also _hedaers.
export default defineEventHandler((event) => {
  event.node.res.setHeader(
    'Content-Security-Policy',
    "object-src 'none'; worker-src blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.facebook.net ilovefreegle.matomo.cloud *.google.com *.gstatic.com cdn.jsdelivr.net *.paypalobjects.com securepubads.g.doubleclick.net *.googlesyndication.com; report-uri https://fdapilive.ilovefreegle.org/csp.php"
  )
})
