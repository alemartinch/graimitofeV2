export const Update = {
  data() {
    return {
      // refresh variables
      refreshing: false,
      registration: null,
      updateExists: false,
    };
  },

  created() {
    // Listen for our custom event from the SW registration
    document.addEventListener("swUpdated", this.updateAvailable, {
      once: true,
    });

    // Prevent multiple refreshes
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (this.refreshing) return;
      this.refreshing = true;
      // Here the actual reload of the page occurs
      console.log("Reloading after update");
      window.location.reload();
    });
  },

  methods: {
    // Store the SW registration so we can send it a message
    // We use `updateExists` to control whatever alert, toast, dialog, etc we want to use
    // To alert the user there is an update they need to refresh for
    async updateAvailable(event) {
      this.registration = event.detail;
      await this.clearCaches()
      // DO NOT SHOW THE CONFIRM DIALOG FOR NOW, JUST RUN THE UPDATE & REFRESH
      // this.updateExists = true;
      await this.refreshApp();
    },

    // Called when the user accepts the update
    async refreshApp() {
      this.updateExists = false;
      // Make sure we only send a 'skip waiting' message if the SW is waiting
      if (!this.registration || !this.registration.waiting) return;
      // send message to SW to skip the waiting and activate the new SW
      this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    },

    async clearCaches() {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
      console.log("Caches cleared");
    },
  },
};
