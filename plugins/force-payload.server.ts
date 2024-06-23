// Without this, payload is not generated and pre-render fails.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.payload.prerenderedAt = Date.now()
})
