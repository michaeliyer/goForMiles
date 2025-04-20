let db;

export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("milesMediaDB", 1);

    request.onupgradeneeded = function (event) {
      db = event.target.result;
      if (!db.objectStoreNames.contains("albums")) {
        const albumStore = db.createObjectStore("albums", { keyPath: "name" });
      }
    };

    request.onsuccess = function (event) {
      db = event.target.result;
      console.log("🎶 IndexedDB ready");
      resolve();
    };

    request.onerror = function (event) {
      console.error("❌ DB error:", event.target.errorCode);
      reject(event.target.errorCode);
    };
  });
}

export function saveAlbum(name, trackList) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["albums"], "readwrite");
    const store = tx.objectStore("albums");

    const data = {
      name: name,
      tracks: trackList.map((t) => ({
        name: t.name,
        file: t.file,
        type: t.file.type,
        added: Date.now()
      }))
    };

    const request = store.put(data);
    request.onsuccess = () => {
      console.log(`💾 Saved album: ${name}`);
      resolve();
    };
    request.onerror = (e) => reject(e);
  });
}

export function loadAllAlbums() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["albums"], "readonly");
    const store = tx.objectStore("albums");
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = (e) => reject(e);
  });
}