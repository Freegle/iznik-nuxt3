import { GlobalRegistrator } from '@happy-dom/global-registrator'

export async function setup() {
  // Register happy-dom globals before Nuxt environment loads
  GlobalRegistrator.register()
  console.log('Global setup: happy-dom registered')
}

export async function teardown() {
  // Unregister when done
  GlobalRegistrator.unregister()
  console.log('Global teardown: happy-dom unregistered')
}
