import {
  validateAlbumData,
  handleStorageError,
  checkStorageQuota,
} from "./utils.js";

let db;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("milesMediaDB", 1);

    request.onupgradeneeded = function (event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains("albums")) {
        const albumStore = db.createObjectStore("albums", { keyPath: "name" });
        albumStore.createIndex("added", "added", { unique: false });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      console.log("🎶 IndexedDB ready");
      resolve();
    };

    request.onerror = function (event) {
      console.error("❌ DB error:", event.target.errorCode);
      reject(handleStorageError(event.target.error));
    };
  });
}

export async function saveAlbum(name, trackList) {
  try {
    // Check storage quota before saving
    const quota = await checkStorageQuota();
    if (quota) {
      const estimatedSize = trackList.reduce(
        (acc, track) => acc + track.file.size,
        0
      );
      if (quota.used + estimatedSize > quota.quota * 0.9) {
        // 90% threshold
        throw new Error("QUOTA_EXCEEDED");
      }
    }

    const tx = db.transaction(["albums"], "readwrite");
    const store = tx.objectStore("albums");

    const data = {
      name: name,
      tracks: trackList.map((t) => ({
        name: t.name,
        file: t.file,
        type: t.file.type,
        added: Date.now(),
      })),
    };

    validateAlbumData(data);

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => {
        console.log(`💾 Saved album: ${name}`);
        resolve();
      };
      request.onerror = (e) => reject(handleStorageError(e.target.error));
    });
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw handleStorageError(error);
  }
}

export function loadAllAlbums() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["albums"], "readonly");
    const store = tx.objectStore("albums");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (e) => reject(handleStorageError(e.target.error));
  });
}

export async function deleteAlbum(name) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["albums"], "readwrite");
    const store = tx.objectStore("albums");
    const request = store.delete(name);

    request.onsuccess = () => {
      console.log(`🗑️ Deleted album: ${name}`);
      resolve();
    };
    request.onerror = (e) => reject(handleStorageError(e.target.error));
  });
}

const DB_NAME = "visualizerMediaDB";
const DB_STORE = "backgrounds";

export async function initMediaDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(handleStorageError(request.error));
  });
}

export async function saveCustomVideo(file) {
  try {
    const quota = await checkStorageQuota();
    if (quota && quota.used + file.size > quota.quota * 0.9) {
      throw new Error("QUOTA_EXCEEDED");
    }

    const db = await initMediaDB();
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(file, "customVideo");
    return tx.complete;
  } catch (error) {
    throw handleStorageError(error);
  }
}

export async function loadCustomVideo() {
  try {
    const db = await initMediaDB();
    const tx = db.transaction(DB_STORE, "readonly");
    return tx.objectStore(DB_STORE).get("customVideo");
  } catch (error) {
    throw handleStorageError(error);
  }
}
