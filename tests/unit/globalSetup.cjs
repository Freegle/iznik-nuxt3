// CommonJS global setup to avoid ESM processing issues
const { GlobalRegistrator } = require('@happy-dom/global-registrator')

module.exports = {
  async setup() {
    GlobalRegistrator.register()
    console.log('Global setup: happy-dom registered')
  },
  async teardown() {
    GlobalRegistrator.unregister()
    console.log('Global teardown: happy-dom unregistered')
  }
}
