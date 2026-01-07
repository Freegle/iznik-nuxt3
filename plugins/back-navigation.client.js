import { action } from '~/composables/useClientLog'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const HISTORY_KEY = 'freegle_nav_history'

  const isMessagePage = (path) => /^\/message\/\d+/.test(path)

  const getHistory = () => {
    try {
      return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]')
    } catch {
      return []
    }
  }

  const setHistory = (history) => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  }

  // Check if user arrived from same origin
  const referrer = document.referrer
  const sameOrigin =
    referrer && new URL(referrer).origin === window.location.origin

  // Initialize history
  if (!sameOrigin) {
    setHistory([window.location.pathname])
  }

  // Track forward navigations
  router.afterEach((to) => {
    const history = getHistory()
    if (history[history.length - 1] !== to.path) {
      history.push(to.path)
      setHistory(history)
    }
  })

  // Handle back button
  window.addEventListener('popstate', () => {
    const currentPath = window.location.pathname
    const history = getHistory()

    // Log for debugging mobile navigation issues.
    const willNavigateHome = !sameOrigin && history.length <= 1
    action('back_nav_popstate', {
      current_path: currentPath,
      history_length: history.length,
      same_origin: sameOrigin,
      is_message_page: isMessagePage(currentPath),
      will_navigate_home: willNavigateHome,
    })

    // Sync history with browser back - remove entries we've passed
    while (history.length > 1 && history[history.length - 1] !== currentPath) {
      history.pop()
    }

    // If on a message page, find the last non-message page to go to
    if (isMessagePage(currentPath)) {
      for (let i = history.length - 2; i >= 0; i--) {
        if (!isMessagePage(history[i])) {
          setHistory(history.slice(0, i + 1))
          router.replace(history[i])
          return
        }
      }

      // No non-message page found, go to home
      setHistory(['/'])
      router.replace('/')
      return
    }

    // No same-origin history and exhausted our tracked history
    if (!sameOrigin && history.length <= 1) {
      setHistory(['/'])
      router.replace('/')
      return
    }

    setHistory(history)
  })
})
