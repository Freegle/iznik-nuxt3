import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import { getSessionId } from '~/composables/useTrace'

export const useLoggingContextStore = defineStore({
  id: 'loggingContext',
  state: () => ({
    pageId: null,
    pageUrl: null,
    pageTitle: null,
    modalStack: [], // [{ id, name }]
    site: null,
  }),
  actions: {
    init(runtimeConfig) {
      if (import.meta.server) return
      this.site = runtimeConfig?.public?.SITE || 'FD'
    },

    startPage(route) {
      this.pageId = 'page_' + Math.random().toString(36).slice(2, 10)
      this.pageUrl = route.path
      this.modalStack = []

      // Capture title after render.
      if (typeof document !== 'undefined') {
        nextTick(() => {
          this.pageTitle = document.title
        })
      }
    },

    pushModal(name) {
      const id = 'modal_' + Math.random().toString(36).slice(2, 8)
      this.modalStack.push({ id, name })
      return id
    },

    popModal() {
      return this.modalStack.pop()?.id
    },

    // Headers for API calls.
    getHeaders() {
      const sessionId = getSessionId()
      return {
        'X-Freegle-Session': sessionId || '',
        'X-Freegle-Page': this.pageId || '',
        'X-Freegle-Modal': this.modalStack.map((m) => m.id).join(','),
        'X-Freegle-Site': this.site || '',
      }
    },

    // Full context for client-side logging.
    getContext() {
      const sessionId = getSessionId()
      return {
        session_id: sessionId,
        page_id: this.pageId,
        page_url: this.pageUrl,
        page_title: this.pageTitle,
        modal_stack: this.modalStack.map((m) => m.id),
        modal_names: this.modalStack.map((m) => m.name),
        site: this.site,
      }
    },
  },
})
