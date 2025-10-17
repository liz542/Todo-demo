/* public/firebase-messaging-sw.js - template for FCM */
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Reminder'
  const options = {
    body: data.body || '',
    data: data,
    actions: [
      {action: 'dismiss', title: 'Dismiss'},
      {action: 'snooze_5', title: 'Snooze 5m'},
      {action: 'snooze_10', title: 'Snooze 10m'},
      {action: 'snooze_30', title: 'Snooze 30m'}
    ]
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  const action = event.action
  const data = event.notification.data || {}
  event.notification.close()
  event.waitUntil(clients.matchAll({type:'window', includeUncontrolled:true}).then(windowClients=>{
    if(windowClients.length){
      windowClients[0].postMessage({action, data})
      windowClients[0].focus()
    }
  }))
})
