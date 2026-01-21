/**
 *
 * @param {import('@playwright/test').FullConfig} config
 */
export default async function globalSetup(config) {
  console.log('Playwright global setup start')

  try {
    const setupResponse = await fetch(
      // TODO Finnbarr: don't hard-code base API URL.
      'http://apiv1.localhost/api/test?action=SetupDB'
    )

    if (!setupResponse.ok) {
      throw new Error(
        `Failed to setup test database. Status: ${setupResponse.status}`
      )
    }
  } catch (error) {
    console.error(`Error during Playwright global setup:\n ${error}`)
    throw error
  }

  console.log('Playwright global setup end')

  return function globalTeardown() {
    console.log('Playwright global teardown start')

    // Teardown here

    console.log('Playwright global teardown end')
  }
}
