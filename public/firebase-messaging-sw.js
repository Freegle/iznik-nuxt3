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

self.addEventListener('push', function(e) {
  data = e.data.json()
  console.log('[firebase-messaging-sw.js] Received push event', data)

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

  const fcmId = data.fcmMessageId

  // Close (other) notifications.  The timining is unpredictable so make sure
  // we don't close the new one.
  self.registration.getNotifications().then((notifications) => {
    console.log('Got existing notifications', notifications)
    notifications.forEach((notification) => {
      console.log('Close it?', fcmId, notification.fcmMessageId)

      if (fcmId !== notification.fcmMessageId) {
        console.log('Yes')
        notification.close()
      } else {
        console.log('No')
      }
    })
  }).catch((err) => {
    console.log('Service worker error', err)
  })

  if (data?.notification?.title) {
    console.log('Show new')
    return e.waitUntil(self.registration.showNotification(data?.notification?.title, options))
  }
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