export default defineNuxtPlugin(() => {
  const router = useRouter()

  // Check if user arrived from a different origin or direct navigation
  const referrer = document.referrer
  const sameOrigin =
    referrer && new URL(referrer).origin === window.location.origin

  if (!sameOrigin) {
    // User arrived directly (new tab, bookmark, external link)
    // If they hit back, go to home instead of leaving the site
    window.addEventListener('popstate', () => {
      router.push('/')
    })
  }
})
