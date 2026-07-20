/**
 * UploadQueue class.
 * Ensures that no more than 3 files are being uploaded concurrently.
 * Additional files are queued and executed when previous uploads finish.
 */
class UploadQueue {
  constructor(maxConcurrency = 3) {
    this.maxConcurrency = maxConcurrency;
    this.queue = [];
    this.runningCount = 0;
  }

  /**
   * Enqueue an upload function.
   *
   * @param {function} uploadFn - A function that returns a Promise (e.g. () => uploadImage(...))
   * @returns {Promise<any>}
   */
  enqueue(uploadFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({ uploadFn, resolve, reject });
      this.next();
    });
  }

  /**
   * Process the next task in the queue.
   */
  next() {
    if (this.runningCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const { uploadFn, resolve, reject } = this.queue.shift();
    this.runningCount++;

    uploadFn()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.runningCount--;
        this.next();
      });
  }
}

// Export a singleton queue configured for a concurrency limit of 3.
export const uploadQueue = new UploadQueue(3);
