/**
 * Service Worker Registration with Debouncing
 * 
 * Prevents repeated registration checks on every page load.
 * Only registers the service worker once and handles updates gracefully.
 */

const SW_REGISTERED_KEY = '__sw_registered__';

export function register() {
  if ("serviceWorker" in navigator) {
    // Check if we've already registered in this session to avoid repeated network checks
    const isRegistered = sessionStorage.getItem(SW_REGISTERED_KEY);
    
    window.addEventListener("load", () => {
      if (isRegistered) {
        // Already registered, skip re-registration
        return;
      }

      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          sessionStorage.setItem(SW_REGISTERED_KEY, 'true');
          console.log("SW registered:", registration.scope);
          
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    console.log("New content available — refresh to update.");
                  } else {
                    console.log("Content cached for offline use.");
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error("SW registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
      sessionStorage.removeItem(SW_REGISTERED_KEY);
    });
  }
}
