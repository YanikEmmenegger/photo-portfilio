// public/notification-sw.js

self.addEventListener("push", function (event) {
    const data = event.data?.json() || {};

    const title = data.title || "New Notification";
    const options = {
        body: data.body || "", icon: "http://localhost:5173/favicon.ico"
    };

    event.waitUntil(self.registration.showNotification(title, options));
});
