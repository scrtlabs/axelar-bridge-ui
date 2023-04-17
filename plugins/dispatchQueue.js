export default ({ store }, inject) => {
  const dispatchQueue = {
    queue: [],
    inProgress: false,

    addToQueue(action, payload) {
      this.queue.push({ action, payload });

      if (!this.inProgress) {
        this.processQueue();
      }
    },

    async processQueue() {
      if (this.queue.length === 0) {
        this.inProgress = false;
        return;
      }

      this.inProgress = true;

      const { action, payload } = this.queue.shift();
      await store.dispatch(action, payload);
      this.processQueue();
    },
  };

  inject('dispatchQueue', dispatchQueue);
};
