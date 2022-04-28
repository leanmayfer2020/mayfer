console.log("Service Worker Loaded...");

self.addEventListener('push', e => {
    console.log('Try to Push Recivied...');
    console.log('Worker => ', e);
    const data = e.data.json();
    console.log('Push Recivied...');
    console.log('Push Recivied...', data);
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        image: data.image,
        badge: data.badge
    });
})

self.addEventListener('notificationclick', function(event) {
    let url = 'https://example.com/some-path/';
    event.notification.close(); // Android needs explicit close.
    event.waitUntil(
        clients.matchAll({type: 'window'}).then( windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});