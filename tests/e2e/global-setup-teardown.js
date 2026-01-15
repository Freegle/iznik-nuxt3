import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

/**
 *
 * @param {import('@playwright/test').FullConfig} config
 */
export default async function globalSetup(config) {
  console.log('Playwright global setup start')

  try {
    // TODO Finnbarr: this only works locally right now, fix Playwright Docker image to copy over script
    await execAsync('sh ../scripts/setup-test-database.sh')
  } catch (error) {
    console.error(`Error during Playwright global setup:\n ${error.stdout}`)
    throw error
  }

  console.log('Playwright global setup end')

  return function globalTeardown() {
    console.log('Playwright global teardown start')

    // Teardown here

    console.log('Playwright global teardown end')
  }
}
