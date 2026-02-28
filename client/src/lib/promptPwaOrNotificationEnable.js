import Swal from "sweetalert2";
import { subscribeToPush } from "./subscribeToPush";

let deferredPrompt;

// --- BEFORE INSTALL PROMPT LISTENER ---
if (!window._pwaListenerAttached) {
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("✅ beforeinstallprompt fired:", e);
    e.preventDefault(); // prevent auto banner
    deferredPrompt = e;
  });
  window._pwaListenerAttached = true;
}

// --- PROMPT PWA INSTALLATION ---
export const promptPwaInstall = async () => {
  const ua = navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isFirefox = ua.includes("firefox");

  if (isIos) {
    Swal.fire({
      title: "📱 iOS Users",
      text: 'Tap the Share button and select "Add to Home Screen".',
      icon: "info",
      confirmButtonColor: "#22c55e",
    });
    return;
  }

  if (isFirefox) {
    Swal.fire({
      title: "🦊 Firefox Users",
      text: 'Use the browser menu (☰) → "Install" to add Brittoo to your home screen.',
      icon: "info",
      confirmButtonColor: "#22c55e",
    });
    return;
  }

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;

    if (outcome === "accepted") {
      Swal.fire({
        title: "🎉 Installed!",
        text: "Brittoo added to your home screen!",
        icon: "success",
        confirmButtonColor: "#22c55e",
      });
    }
  } else {
    Swal.fire({
      title: "⚠️ Install Not Available",
      text: "Use browser menu to install Brittoo.",
      icon: "warning",
      confirmButtonColor: "#22c55e",
    });
  }
};

// --- PROMPT AND ENABLE NOTIFICATIONS ---
export const promptNotifications = async () => {
  try {
    await subscribeToPush();
    Swal.fire({
      title: "🔔 Notifications Enabled",
      text: "You'll now receive updates from Brittoo!",
      icon: "success",
      confirmButtonColor: "#22c55e",
    });
  } catch (err) {
    Swal.fire({
      title: "⚠️ Push Subscription Failed",
      text: "Could not enable notifications. Make sure you are on HTTPS and service worker is registered.",
      icon: "error",
      confirmButtonColor: "#22c55e",
    });
    console.error(err);
  }
};

// --- COMBINED PROMPT ---
export const promptPwaOrNotificationEnable = async () => {
  await promptPwaInstall();
  await promptNotifications();
};
