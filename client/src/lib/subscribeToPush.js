import api from "./api";

// Convert VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

export const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported in this browser.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;

    if (Notification.permission === "denied") {
      console.warn("Notifications are blocked by user.");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        import.meta.env.VITE_VAPID_PUBLIC_KEY
      ),
    });

    // Send subscription to backend
    await api.post("/api/v1/notifications/subscribe", {
      subscription: subscription.toJSON(),
    });

    console.log("✅ Push subscription successful");
    return subscription;

  } catch (err) {
    console.error("❌ Failed to subscribe to push notifications:", err);
    throw err; // propagate to caller
  }
};
