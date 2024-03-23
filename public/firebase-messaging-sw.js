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

self.addEventListener('push', function(e) {
  data = e.data.json()
  console.log('[firebase-messaging-sw.js] Received push event', data)
  const options = {
    tag: 'notification-1',
    body: data.notification.body,
    vibrate: [100, 50, 100],
    icon: '/logos/user_logo_vector.svg',
    badge: '/logos/user_logo_vector.svg',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    }
  }

  // We only want one notification.
  self.registration.hideNotification()
  self.registration.showNotification(data.notification.title, options)
})

self.addEventListener(
  'notificationclick',
  function(event) {
    console.log('test', event)
    event.notification.close()
    const url = '/'
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