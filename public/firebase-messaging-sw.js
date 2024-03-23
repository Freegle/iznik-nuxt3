importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: 'AIzaSyC_ccagN3vfbu6kbEFI0_FmjYec5pft0B8',
  authDomain: 'scenic-oxygen-849.firebaseapp.com',
  databaseURL: 'https://scenic-oxygen-849.firebaseio.com',
  projectId: 'scenic-oxygen-849',
  storageBucket: 'scenic-oxygen-849.appspot.com',
  messagingSenderId: '423761283916',
  appId: '1:423761283916:web:20c1e8e44bd83b891f1de9',
  measurementId: 'G-86N0ZCZ2ZW'
})

const messaging = firebase.messaging()

messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ')
  // self.registration.hideNotification();

  return null
})

async function processEvent(e) {
  data = e.data.json()
  console.log('[firebase-messaging-sw.js] Received push event', data)

  // We only want one notification, so hide any others currently open.
  // const notifications = await self.registration.getNotifications()
  // console.log('Got existing notifications', notifications)
  // const promises = []
  // notifications.forEach((notification) => {
  //   console.log('Close', notification)
  //   promises.push(notification.close())
  // })
  //
  // console.log('Wait for all to close')
  // await Promise.all(promises)
  // console.log('Closed')

  const options = {
    tag: 'notification-1',
    renotify: true,
    body: data?.notification?.body,
    vibrate: [100, 50, 100],
    icon: '/logos/user_logo_512x512.png',
    badge: '/logos/user_logo_24x24.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1',
      dataInNotification: data.data
    }
  }

  if (data?.notification?.title) {
    await self.registration.showNotification(data?.notification?.title, options)
    console.log('Shown new')
  }
}

self.addEventListener('push', function(e) {
  // We use this as a way of waiting until the await function has completed.
  // This avoids duplicate notifications.
  e.waitUntil(processEvent(e))
})

self.addEventListener(
  'notificationclick',
  function(event) {
    console.log('Clicked', event)
    event.notification.close()

    // The notification from the server passes the route we should navigate to.
    const url = event.notification.data?.dataInNotification?.route ? event.notification.data?.dataInNotification?.route : '/'
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(windowClients => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          // If so, just focus it.

          if (client.url === url && 'focus' in client) {
            return client.focus()
          }
        }

        if (self.clients.openWindow) {
          clients.openWindow(url)
        }
      })
    )
  },
  false
)

console.log('Service worker registered')