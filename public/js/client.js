const publicVapidKey = "BFF43CpTYGvq5UkCKlSEHWGVxRP0BozrJRKaHui0mK8IGcIxS8E9b6DZ_hiMgvIwpMh_OA-e_USF7o4cyPnjU3A";

// Check for service worker
if('serviceWorker' in navigator){
    send().catch(err => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {
    // Register Service Worker
    console.log('Registering service worker...');
    const register = await navigator.serviceWorker.register(configSourcePath+'/js/worker.js', {
        scope: '/'
    });
    console.log('Service Worker Registered...');

    // Register Push
    console.log('Registering Push...');
    console.log("Encoded public key", urlBase64ToUint8Array(publicVapidKey));
    const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Push Registered...');
    console.log('subscription', subscription);

    console.log('p256dh', subscription.toJSON().keys.p256dh);
    console.log('auth', subscription.toJSON().keys.auth);

    var data = {
        'endpoint':subscription.endpoint,
        'p256dh':subscription.toJSON().keys.p256dh,
        'auth':subscription.toJSON().keys.auth
    }


    await fetch('/save-push', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        }
    });

    // Send Push Notification
    console.log('Sending Push...');
    await fetch('/subscribe-push', {
        method: "POST",
        body: JSON.stringify(subscription),
        headers: {
            'content-type': 'application/json'
        }
    });
    console.log("Push Sent...");

}

// https://github.com/web-push-libs/web-push
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}