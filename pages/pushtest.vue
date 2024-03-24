<template>
  <client-only>
    <h2>Push notification test</h2>
    <b-button variant="primary" @click="askForToken">Get token</b-button>
    <p class="mt-2">Token is: {{ token }}</p>
  </client-only>
</template>
<script setup>
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

const firebaseConfig = {
  apiKey: 'AIzaSyC_ccagN3vfbu6kbEFI0_FmjYec5pft0B8',
  authDomain: 'scenic-oxygen-849.firebaseapp.com',
  databaseURL: 'https://scenic-oxygen-849.firebaseio.com',
  projectId: 'scenic-oxygen-849',
  storageBucket: 'scenic-oxygen-849.appspot.com',
  messagingSenderId: '423761283916',
  appId: '1:423761283916:web:20c1e8e44bd83b891f1de9',
  measurementId: 'G-86N0ZCZ2ZW',
}

initializeApp(firebaseConfig)

const VAPID_KEY =
  'BKUxrUYbFyfSid___nqy45IrdR3sQ8VdYirTaFhI7P8g4Uu5TdCp71QOXVeLM5gULNzlNebW23gfDlix8akJnbI'

const token = ref(null)

async function checkForToken() {
  try {
    const messaging = getMessaging()
    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    })
    console.log('Got initial token', currentToken)

    if (currentToken) {
      return currentToken
    }
  } catch (e) {
    console.log('Check token failued', e)
  }

  return null
}

async function askForToken() {
  try {
    const messaging = getMessaging()
    const permission = await Notification.requestPermission()
    console.log('Permission', permission)
    if (permission === 'granted') {
      console.log('Notification permission granted.')

      token.value = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      })
      console.log('Asked for and received token', token.value)
    }
  } catch (e) {
    console.log('Ask token faileed', e)
  }
}

watch(
  token,
  (newVal) => {
    if (newVal) {
      console.log('Token changed', newVal)
      authStore.saveBrowserPushToken(newVal)
    }
  },
  {
    immediate: true,
  }
)

onMounted(async () => {
  token.value = await checkForToken()

  console.log('Set up listen')
  const messaging = getMessaging()
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload)
  })
  console.log('Listening')
})
</script>
