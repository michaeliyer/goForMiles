// Memory Management
export function cleanupObjectURL(url) {
  if (url) URL.revokeObjectURL(url);
}

// Storage Management
export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage;
      const quota = estimate.quota;
      return { used, quota };
    } catch (error) {
      console.error("Error checking storage quota:", error);
      return null;
    }
  }
  return null;
}

// Data Validation
export function validateAlbumData(album) {
  if (!album.name || typeof album.name !== "string") {
    throw new Error("Invalid album name");
  }
  if (!Array.isArray(album.tracks)) {
    throw new Error("Invalid tracks data");
  }
  return true;
}

// Error Handling
export class StorageError extends Error {
  constructor(message, type) {
    super(message);
    this.name = "StorageError";
    this.type = type;
  }
}

export function handleStorageError(error) {
  if (error.name === "QuotaExceededError") {
    throw new StorageError(
      "Storage is full. Please delete some tracks to free up space.",
      "QUOTA_EXCEEDED"
    );
  } else if (error.name === "NotFoundError") {
    throw new StorageError("Requested data not found.", "NOT_FOUND");
  } else {
    throw new StorageError(
      "An error occurred while accessing storage.",
      "UNKNOWN"
    );
  }
}

// Progress Tracking
export class ProgressTracker {
  constructor(total) {
    this.total = total;
    this.current = 0;
    this.callbacks = [];
  }

  update(progress) {
    this.current = progress;
    this.callbacks.forEach((callback) => callback(this.current, this.total));
  }

  onProgress(callback) {
    this.callbacks.push(callback);
  }
}
