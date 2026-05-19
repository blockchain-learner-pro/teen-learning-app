export function register() {
  // PWA disabled for stability (temporary fix)
  console.log("Service worker disabled for debugging");
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.unregister();
    });
  }
}