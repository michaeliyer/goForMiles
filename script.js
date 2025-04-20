// // === IMPORT DB ===
// import { initDB, saveAlbum, loadAllAlbums } from "./db.js";
// import { initMediaDB, saveCustomVideo, loadCustomVideo } from "./db.js";

// // === DOM ELEMENTS ===
// const fileInput = document.getElementById("fileInput");
// const uploadBtn = document.getElementById("uploadBtn");
// const newAlbumBtn = document.getElementById("newAlbumBtn");
// const albumSelect = document.getElementById("albumSelect");
// const trackList = document.getElementById("trackList");
// const mediaElement = document.getElementById("mediaElement");
// const visualizer = document.getElementById("visualizer");
// const nowPlaying = document.getElementById("nowPlaying");
// const playBtn = document.getElementById("playBtn");
// const repeatBtn = document.getElementById("repeatBtn");
// const seekBar = document.getElementById("seekBar");
// const toggleBgBtn = document.getElementById("toggleBgBtn");

// let tracks = {}; // { albumName: [ {name, file, type, added} ] }
// let currentAlbum = null;
// let currentTrack = null;
// let isRepeating = false;

// let audioCtx;
// let analyser;
// let sourceNode;
// let animationFrame;

// // === BACKGROUND TOGGLE ===
// toggleBgBtn.addEventListener("click", () => {
//   document.body.classList.toggle("still-mode");
//   toggleBgBtn.textContent =
//     document.body.classList.contains("still-mode")
//       ? "🎥 Switch to Video"
//       : "🎬 Switch to Still";
// });

// // === VISUALIZER ===
// function startVisualizer() {
//   if (!audioCtx) {
//     audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//     sourceNode = audioCtx.createMediaElementSource(mediaElement);
//     analyser = audioCtx.createAnalyser();
//     sourceNode.connect(analyser);
//     analyser.connect(audioCtx.destination);
//     analyser.fftSize = 64;
//   }

//   if (animationFrame) return; // already running

//   const bufferLength = analyser.frequencyBinCount;
//   const dataArray = new Uint8Array(bufferLength);
//   const ctx = visualizer.getContext("2d");

//   function draw() {
//     animationFrame = requestAnimationFrame(draw);
//     analyser.getByteFrequencyData(dataArray);
//     ctx.clearRect(0, 0, visualizer.width, visualizer.height);
//     const barWidth = visualizer.width / bufferLength;
//     for (let i = 0; i < bufferLength; i++) {
//       const height = (dataArray[i] / 255) * visualizer.height;
//       ctx.fillStyle = `rgb(${dataArray[i] + 100}, 50, 50)`;
//       ctx.fillRect(i * barWidth, visualizer.height - height, barWidth - 1, height);
//     }
//   }

//   draw();
// }

// function stopVisualizer() {
//   cancelAnimationFrame(animationFrame);
//   animationFrame = null;
// }

// // === PLAYER ===
// playBtn.addEventListener("click", () => {
//   if (mediaElement.paused) {
//     mediaElement.play().then(() => {
//       playBtn.textContent = "⏸️";
//       startVisualizer();
//     });
//   } else {
//     mediaElement.pause();
//     playBtn.textContent = "▶️";
//     stopVisualizer();
//   }
// });

// repeatBtn.addEventListener("click", () => {
//   isRepeating = !isRepeating;
//   repeatBtn.textContent = isRepeating ? "🔁 ON" : "🔁";
// });

// mediaElement.addEventListener("ended", () => {
//   if (isRepeating && currentTrack) {
//     playTrack(currentTrack);
//   } else {
//     playBtn.textContent = "▶️";
//     stopVisualizer();
//   }
// });

// mediaElement.addEventListener("timeupdate", () => {
//   seekBar.value = mediaElement.currentTime;
//   seekBar.max = mediaElement.duration || 1;
// });

// seekBar.addEventListener("input", () => {
//   mediaElement.currentTime = seekBar.value;
// });

// function playTrack(track) {
//   currentTrack = track;
//   nowPlaying.textContent = `🎶 ${track.name}`;
//   const objectURL = URL.createObjectURL(track.file);
//   mediaElement.src = objectURL;
//   mediaElement.load();
//   mediaElement.play();
//   playBtn.textContent = "⏸️";
//   startVisualizer();
//   document.getElementById("playerSection").classList.remove("hidden");
// }

// function renderTracks(album) {
//   trackList.innerHTML = "";
//   const list = tracks[album] || [];

//   list.forEach((track, index) => {
//     const div = document.createElement("div");
//     div.className = "track-item";
//     const title = document.createElement("h3");
//     title.textContent = track.name;
//     const actions = document.createElement("div");
//     actions.className = "track-actions";

//     const play = document.createElement("button");
//     play.textContent = "▶️";
//     play.addEventListener("click", () => playTrack(track));

//     const download = document.createElement("button");
//     download.textContent = "⬇️";
//     download.addEventListener("click", () => {
//       const url = URL.createObjectURL(track.file);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${track.name}`;
//       a.click();
//       URL.revokeObjectURL(url);
//     });

//     const del = document.createElement("button");
//     del.textContent = "🗑";
//     del.addEventListener("click", async () => {
//       tracks[album].splice(index, 1);
//       await saveAlbum(album, tracks[album]);
//       renderTracks(album);
//     });

//     actions.append(play, download, del);
//     div.append(title, actions);
//     trackList.appendChild(div);
//   });
// }

// uploadBtn.addEventListener("click", () => {
//   if (!currentAlbum) {
//     alert("Please create or select an album first.");
//     return;
//   }
//   fileInput.click();
// });

// fileInput.addEventListener("change", async (e) => {
//   const files = Array.from(e.target.files);
//   files.forEach((file) => {
//     if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
//       tracks[currentAlbum].push({ name: file.name, file });
//     }
//   });
//   await saveAlbum(currentAlbum, tracks[currentAlbum]);
//   renderTracks(currentAlbum);
//   fileInput.value = "";
// });

// newAlbumBtn.addEventListener("click", () => {
//   const name = prompt("Enter new album name:");
//   if (!name) return;
//   if (!tracks[name]) {
//     tracks[name] = [];
//     const option = document.createElement("option");
//     option.value = name;
//     option.textContent = name;
//     albumSelect.appendChild(option);
//     albumSelect.value = name;
//     currentAlbum = name;
//     renderTracks(name);
//   } else {
//     alert("Album already exists!");
//   }
// });

// albumSelect.addEventListener("change", () => {
//   currentAlbum = albumSelect.value;
//   renderTracks(currentAlbum);
// });

//   await initDB();
//   const albums = await loadAllAlbums();
//   albums.forEach((album) => {
//     tracks[album.name] = album.tracks;
//     const option = document.createElement("option");
//     option.value = album.name;
//     option.textContent = album.name;
//     albumSelect.appendChild(option);
//   });

//   if (albums.length) {
//     currentAlbum = albums[0].name;
//     albumSelect.value = currentAlbum;
//     renderTracks(currentAlbum);
//   }

//   // === BACKGROUND MODE LOAD + SELECT ===
//   const bgModeSelect = document.getElementById("bgMode");
//   const savedMode = localStorage.getItem("bgMode") || "video";
//   document.body.classList.add(`${savedMode}-mode`);
//   bgModeSelect.value = savedMode;

//   bgModeSelect.addEventListener("change", () => {
//     document.body.classList.remove("video-mode", "image-mode", "color-mode");
//     const mode = bgModeSelect.value;
//     document.body.classList.add(`${mode}-mode`);
//     localStorage.setItem("bgMode", mode);
//   });

//   // === COLOR PICKER ===
//   const colorPicker = document.getElementById("colorPicker");
//   const savedColor = localStorage.getItem("bgColor") || "#111111";
//   document.documentElement.style.setProperty("--bg-color", savedColor);
//   colorPicker.value = savedColor;

//   colorPicker.addEventListener("input", () => {
//     const color = colorPicker.value;
//     document.documentElement.style.setProperty("--bg-color", color);
//     localStorage.setItem("bgColor", color);
//   });

//   // === IMAGE UPLOAD ===
//   const imageUploader = document.getElementById("imageUploader");
//   const bgStyle = document.body.style;

//   const storedImage = localStorage.getItem("customImage");
//   if (storedImage) {
//     bgStyle.setProperty("--custom-image", `url('${storedImage}')`);
//   }

//   imageUploader.addEventListener("change", (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       bgStyle.setProperty("--custom-image", `url('${url}')`);
//       localStorage.setItem("customImage", url);
//       document.body.classList.add("image-mode");
//       bgModeSelect.value = "image";
//     }
//   });

//   // === VIDEO UPLOAD ===
//   import { saveCustomVideo, loadCustomVideo } from "./db.js";

//   const bgVideo = document.getElementById("backgroundVideo");
//   const videoUploader = document.getElementById("videoUploader");

//   // === Load persisted custom video on page load ===
//   const restoredBlob = await loadCustomVideo();
//   if (restoredBlob) {
//     const videoUrl = URL.createObjectURL(restoredBlob);
//     bgVideo.src = videoUrl;
//     bgVideo.load();
//     bgVideo.play();
//   }

//   // === Save new custom video when selected ===
//   videoUploader.addEventListener("change", async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       bgVideo.src = url;
//       bgVideo.load();
//       bgVideo.play();

//       await saveCustomVideo(file); // 💾 Persist to IndexedDB

//       document.body.classList.remove("image-mode", "color-mode");
//       document.body.classList.add("video-mode");
//       document.getElementById("bgMode").value = "video";
//     }
//     await initMediaDB(); // right alongside your await initDB()
//   });

// === IMPORT DB ===
import { initDB, saveAlbum, loadAllAlbums } from "./db.js";
import { initMediaDB, saveCustomVideo, loadCustomVideo } from "./db.js";

let tracks = {}; // { albumName: [ {name, file} ] }
let currentAlbum = null;
let currentTrack = null;
let isRepeating = false;

let audioCtx;
let analyser;
let sourceNode;
let animationFrame;

function startVisualizer(mediaElement, visualizer) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  sourceNode = audioCtx.createMediaElementSource(mediaElement);
  analyser = audioCtx.createAnalyser();
  sourceNode.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 64;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  const ctx = visualizer.getContext("2d");

  function draw() {
    animationFrame = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);
    ctx.clearRect(0, 0, visualizer.width, visualizer.height);
    const barWidth = visualizer.width / bufferLength;
    for (let i = 0; i < bufferLength; i++) {
      const height = (dataArray[i] / 255) * visualizer.height;
      ctx.fillStyle = `rgb(${dataArray[i] + 100}, 50, 50)`;
      ctx.fillRect(
        i * barWidth,
        visualizer.height - height,
        barWidth - 1,
        height
      );
    }
  }

  draw();
}

function stopVisualizer() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

function playTrack(track, mediaElement, nowPlaying, visualizer, playBtn) {
  if (!track || !track.file) return;

  currentTrack = track;
  nowPlaying.textContent = `🎶 ${track.name}`;
  const objectURL = URL.createObjectURL(track.file);
  mediaElement.src = objectURL;
  mediaElement.load();
  mediaElement.play().then(() => {
    playBtn.textContent = "⏸️";
    startVisualizer(mediaElement, visualizer);
  });
  document.getElementById("playerSection").classList.remove("hidden");
}

function renderTracks(
  album,
  trackList,
  mediaElement,
  nowPlaying,
  visualizer,
  playBtn
) {
  trackList.innerHTML = "";
  const list = tracks[album] || [];

  list.forEach((track, index) => {
    const div = document.createElement("div");
    div.className = "track-item";
    const title = document.createElement("h3");
    title.textContent = track.name;
    const actions = document.createElement("div");
    actions.className = "track-actions";

    const play = document.createElement("button");
    play.textContent = "▶️";
    play.addEventListener("click", () =>
      playTrack(track, mediaElement, nowPlaying, visualizer, playBtn)
    );

    const download = document.createElement("button");
    download.textContent = "⬇️";
    download.addEventListener("click", () => {
      const url = URL.createObjectURL(track.file);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${track.name}`;
      a.click();
      URL.revokeObjectURL(url);
    });

    const del = document.createElement("button");
    del.textContent = "🗑";
    del.addEventListener("click", async () => {
      tracks[album].splice(index, 1);
      await saveAlbum(album, tracks[album]);
      renderTracks(
        album,
        trackList,
        mediaElement,
        nowPlaying,
        visualizer,
        playBtn
      );
    });

    actions.append(play, download, del);
    div.append(title, actions);
    trackList.appendChild(div);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  await initMediaDB();

  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");
  const newAlbumBtn = document.getElementById("newAlbumBtn");
  const albumSelect = document.getElementById("albumSelect");
  const trackList = document.getElementById("trackList");
  const mediaElement = document.getElementById("mediaElement");
  const visualizer = document.getElementById("visualizer");
  const nowPlaying = document.getElementById("nowPlaying");
  const playBtn = document.getElementById("playBtn");
  const repeatBtn = document.getElementById("repeatBtn");
  const seekBar = document.getElementById("seekBar");
  const bgModeSelect = document.getElementById("bgMode");
  const colorPicker = document.getElementById("colorPicker");
  const imageUploader = document.getElementById("imageUploader");
  const videoUploader = document.getElementById("videoUploader");
  const bgVideo = document.getElementById("backgroundVideo");

  const albums = await loadAllAlbums();
  albums.forEach((album) => {
    tracks[album.name] = album.tracks;
    const option = document.createElement("option");
    option.value = album.name;
    option.textContent = album.name;
    albumSelect.appendChild(option);
  });

  if (albums.length) {
    currentAlbum = albums[0].name;
    albumSelect.value = currentAlbum;
    renderTracks(
      currentAlbum,
      trackList,
      mediaElement,
      nowPlaying,
      visualizer,
      playBtn
    );
  }

  bgModeSelect.value = localStorage.getItem("bgMode") || "video";
  document.body.classList.add(`${bgModeSelect.value}-mode`);
  bgModeSelect.addEventListener("change", () => {
    document.body.classList.remove("video-mode", "image-mode", "color-mode");
    document.body.classList.add(`${bgModeSelect.value}-mode`);
    localStorage.setItem("bgMode", bgModeSelect.value);
  });

  const savedColor = localStorage.getItem("bgColor") || "#111111";
  document.documentElement.style.setProperty("--bg-color", savedColor);
  colorPicker.value = savedColor;
  colorPicker.addEventListener("input", () => {
    const color = colorPicker.value;
    document.documentElement.style.setProperty("--bg-color", color);
    localStorage.setItem("bgColor", color);
  });

  const bgStyle = document.body.style;
  const storedImage = localStorage.getItem("customImage");
  if (storedImage) {
    bgStyle.setProperty("--custom-image", `url('${storedImage}')`);
  }

  imageUploader.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      bgStyle.setProperty("--custom-image", `url('${url}')`);
      localStorage.setItem("customImage", url);
      document.body.classList.add("image-mode");
      bgModeSelect.value = "image";
    }
  });

  const restoredBlob = await loadCustomVideo();
  if (restoredBlob) {
    const videoUrl = URL.createObjectURL(restoredBlob);
    bgVideo.src = videoUrl;
    bgVideo.load();
    bgVideo.play();
  }

  videoUploader.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      bgVideo.src = url;
      bgVideo.load();
      bgVideo.play();
      await saveCustomVideo(file);
      document.body.classList.remove("image-mode", "color-mode");
      document.body.classList.add("video-mode");
      bgModeSelect.value = "video";
    }
  });

  playBtn.addEventListener("click", () => {
    if (mediaElement.src) {
      if (mediaElement.paused) {
        mediaElement.play();
        playBtn.textContent = "⏸️";
        startVisualizer(mediaElement, visualizer);
      } else {
        mediaElement.pause();
        playBtn.textContent = "▶️";
        stopVisualizer();
      }
    }
  });

  repeatBtn.addEventListener("click", () => {
    isRepeating = !isRepeating;
    repeatBtn.textContent = isRepeating ? "🔁 ON" : "🔁";
  });

  mediaElement.addEventListener("ended", () => {
    if (isRepeating && currentTrack) {
      playTrack(currentTrack, mediaElement, nowPlaying, visualizer, playBtn);
    } else {
      playBtn.textContent = "▶️";
      stopVisualizer();
    }
  });

  mediaElement.addEventListener("timeupdate", () => {
    seekBar.value = mediaElement.currentTime;
    seekBar.max = mediaElement.duration || 1;
  });

  seekBar.addEventListener("input", () => {
    mediaElement.currentTime = seekBar.value;
  });

  uploadBtn.addEventListener("click", () => {
    if (!currentAlbum) {
      alert("Please create or select an album first.");
      return;
    }
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const files = Array.from(e.target.files);
    if (!tracks[currentAlbum]) tracks[currentAlbum] = [];
    files.forEach((file) => {
      if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
        tracks[currentAlbum].push({ name: file.name, file });
      }
    });
    await saveAlbum(currentAlbum, tracks[currentAlbum]);
    renderTracks(
      currentAlbum,
      trackList,
      mediaElement,
      nowPlaying,
      visualizer,
      playBtn
    );
    fileInput.value = "";
  });

  newAlbumBtn.addEventListener("click", () => {
    const name = prompt("Enter new album name:");
    if (!name) return;
    if (!tracks[name]) {
      tracks[name] = [];
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      albumSelect.appendChild(option);
      albumSelect.value = name;
      currentAlbum = name;
      renderTracks(
        name,
        trackList,
        mediaElement,
        nowPlaying,
        visualizer,
        playBtn
      );
    } else {
      alert("Album already exists!");
    }
  });

  albumSelect.addEventListener("change", () => {
    currentAlbum = albumSelect.value;
    renderTracks(
      currentAlbum,
      trackList,
      mediaElement,
      nowPlaying,
      visualizer,
      playBtn
    );
  });
});
