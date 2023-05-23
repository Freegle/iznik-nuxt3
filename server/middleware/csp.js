export default defineEventHandler((event) => {
  event.node.res.setHeader(
    'Content-Security-Policy-Report-Only',
    "object-src 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.netlify.app *.facebook.net *.google.com; report-uri https://fdapilive.ilovefreegle.org/csp.php"
  )
})
