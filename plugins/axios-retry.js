import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  axios.interceptors.response.use(undefined, (err) => {
    const { config, message } = err

    if (config?.noretry) {
      return Promise.reject(err)
    }

    // Retry certain errors only
    console.log('Axios-retry, error', message)
    if (!(message.includes('timeout') || message.includes('Network Error'))) {
      return Promise.reject(err)
    }

    if (!config.includes('retry')) {
      console.log('No retry config, use default')
      config.retryCount = 10
      config.retryDelay = 1000
    }

    config.retryCount--

    if (config.retryCount === 0) {
      console.log('Out of retries')
      return Promise.reject(err)
    }

    config.retryDelay += 1000

    const delayRetryRequest = new Promise((resolve) => {
      setTimeout(() => {
        console.log('retry the request', config.url)
        resolve()
      }, config.retryDelay)
    })

    return delayRetryRequest.then(() => axios(config))
  })
})
