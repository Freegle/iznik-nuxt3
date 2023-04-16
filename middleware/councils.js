import { navigateTo } from 'nuxt/app'

export default defineNuxtRouteMiddleware(async (to) => {
  console.log('Route to')

  // Regex match /councils/any-thing-here and capture the slug
  const match = to.path.match(/^\/councils\/(.*)$/)

  // If no match, return
  if (!match) return

  // Get the slug from the match
  const slug = match[1]
  console.log('Slug', slug)

  // Redirect /councils route to councils.ilovefreegle.org
  if (to.path === '/councils') {
    navigateTo('https://councils.ilovefreegle.org/' + slug)
  }
})
