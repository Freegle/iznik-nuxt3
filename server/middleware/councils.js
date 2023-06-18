export default defineEventHandler((event) => {
  // Redirect /councils to separate microsite.  Failed to get this working using routeRules.
  const to = event?.node?.req?.url

  // Regex match /councils/any-thing-here and capture the slug
  const match = to?.match(/^\/councils(\/.*)?$/)

  // If no match, return
  if (!match) return

  // Get the slug from the match
  const slug = match[1] ? match[1] : ''

  return sendRedirect(event, 'https://councils.ilovefreegle.org/' + slug, 302)
})
