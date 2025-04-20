// import { initDB, saveAlbum, loadAllAlbums } from "./db.js";


// // === BACKGROUND TOGGLE ===
// document.getElementById("toggleBgBtn").addEventListener("click", () => {
//     const body = document.body;
//     body.classList.toggle("still-mode");
  
//     const isStill = body.classList.contains("still-mode");
//     document.getElementById("toggleBgBtn").textContent = isStill
//       ? "🎥 Switch to Video"
//       : "🎬 Switch to Still";
//   });
  
//   // === DOM ELEMENTS ===
//   const fileInput = document.getElementById("fileInput");
//   const uploadBtn = document.getElementById("uploadBtn");
//   const newAlbumBtn = document.getElementById("newAlbumBtn");
//   const albumSelect = document.getElementById("albumSelect");
//   const trackList = document.getElementById("trackList");
//   const mediaElement = document.getElementById("mediaElement");
//   const visualizer = document.getElementById("visualizer");
//   const nowPlaying = document.getElementById("nowPlaying");
//   const playBtn = document.getElementById("playBtn");
//   const repeatBtn = document.getElementById("repeatBtn");
//   const seekBar = document.getElementById("seekBar");
  
//   let tracks = {};
//   let currentAlbum = null;
//   let currentTrack = null;
//   let isRepeating = false;
  
//   // === AUDIO CONTEXT ===
//   let audioCtx;
//   let analyser;
//   let sourceNode;
//   let animationFrame;
  
//   // === VISUALIZER ===
//   function startVisualizer() {
//     if (!audioCtx) {
//       audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//       sourceNode = audioCtx.createMediaElementSource(mediaElement);
//       analyser = audioCtx.createAnalyser();
//       sourceNode.connect(analyser);
//       analyser.connect(audioCtx.destination);
//       analyser.fftSize = 64;
//     }
  
//     if (animationFrame) return; // Don’t double start
  
//     const bufferLength = analyser.frequencyBinCount;
//     const dataArray = new Uint8Array(bufferLength);
//     const ctx = visualizer.getContext("2d");
  
//     function draw() {
//       animationFrame = requestAnimationFrame(draw);
//       analyser.getByteFrequencyData(dataArray);
//       ctx.clearRect(0, 0, visualizer.width, visualizer.height);
  
//       const barWidth = visualizer.width / bufferLength;
//       for (let i = 0; i < bufferLength; i++) {
//         const height = (dataArray[i] / 255) * visualizer.height;
//         ctx.fillStyle = `rgb(${dataArray[i] + 100}, 50, 50)`;
//         ctx.fillRect(i * barWidth, visualizer.height - height, barWidth - 1, height);
//       }
//     }
  
//     draw();
//   }
  
//   function stopVisualizer() {
//     cancelAnimationFrame(animationFrame);
//     animationFrame = null;
//   }
  
//   // === PLAYER CONTROL ===
//   playBtn.addEventListener("click", () => {
//     if (mediaElement.paused) {
//         mediaElement.play().then(() => {
//           playBtn.textContent = "⏸️";
//           startVisualizer();
//         });
//       } else {
//         mediaElement.pause();
//         playBtn.textContent = "▶️";
//         stopVisualizer();
//       }
//   });
  
//   repeatBtn.addEventListener("click", () => {
//     isRepeating = !isRepeating;
//     repeatBtn.textContent = isRepeating ? "🔁 ON" : "🔁";
//   });
  
//   mediaElement.addEventListener("ended", () => {
//     if (isRepeating && currentTrack) {
//       playTrack(currentTrack);
//     } else {
//       playBtn.textContent = "▶️";
//       cancelAnimationFrame(animationFrame);
//     }
//   });
  
//   mediaElement.addEventListener("timeupdate", () => {
//     seekBar.value = mediaElement.currentTime;
//     seekBar.max = mediaElement.duration || 1;
//   });
  
//   seekBar.addEventListener("input", () => {
//     mediaElement.currentTime = seekBar.value;
//   });
  
//   // === TRACK PLAYBACK ===
//   function playTrack(track) {
//     currentTrack = track;
//     nowPlaying.textContent = `🎶 ${track.name}`;
//     const objectURL = URL.createObjectURL(track.file);
//     mediaElement.src = objectURL;
//     mediaElement.load();
//     mediaElement.play();
//     playBtn.textContent = "⏸️";
//     startVisualizer();
//     document.getElementById("playerSection").classList.remove("hidden");
//   }
  
//   // === RENDER TRACKS ===
//   function renderTracks(album) {
//     trackList.innerHTML = "";
//     const list = tracks[album] || [];
  
//     list.forEach((track, index) => {
//       const div = document.createElement("div");
//       div.className = "track-item";
  
//       const title = document.createElement("h3");
//       title.textContent = track.name;
  
//       const actions = document.createElement("div");
//       actions.className = "track-actions";
  
//       const play = document.createElement("button");
//       play.textContent = "▶️";
//       play.addEventListener("click", () => playTrack(track));
  
//       const download = document.createElement("button");
//       download.textContent = "⬇️";
//       download.addEventListener("click", () => {
//         const url = URL.createObjectURL(track.file);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `${track.name}`;
//         a.click();
//         URL.revokeObjectURL(url);
//       });
  
//       const del = document.createElement("button");
//       del.textContent = "🗑";
//       del.addEventListener("click", () => {
//         tracks[album].splice(index, 1);
//         renderTracks(album);
//       });
  
//       actions.append(play, download, del);
//       div.append(title, actions);
//       trackList.appendChild(div);
//     });
//   }
  
//   // === HANDLE FILE UPLOAD ===
//   uploadBtn.addEventListener("click", () => {
//     if (!currentAlbum) {
//       alert("Please create or select an album first.");
//       return;
//     }
//     fileInput.click();
//   });
  
//   fileInput.addEventListener("change", (e) => {
//     const files = Array.from(e.target.files);
  
//     files.forEach((file) => {
//       if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
//         tracks[currentAlbum].push({ name: file.name, file });
//       }
//     });
  
//     renderTracks(currentAlbum);
//     fileInput.value = "";
//   });
  
//   // === NEW ALBUM CREATION ===
//   newAlbumBtn.addEventListener("click", () => {
//     const name = prompt("Enter new album name:");
//     if (!name) return;
  
//     if (!tracks[name]) {
//       tracks[name] = [];
//       const option = document.createElement("option");
//       option.value = name;
//       option.textContent = name;
//       albumSelect.appendChild(option);
//       albumSelect.value = name;
//       currentAlbum = name;
//       renderTracks(name);
//     } else {
//       alert("Album already exists!");
//     }
//   });
  
//   // === LOAD EXISTING ALBUM ===
//   albumSelect.addEventListener("change", () => {
//     currentAlbum = albumSelect.value;
//     renderTracks(currentAlbum);
//   });

// === IMPORT DB ===
import { initDB, saveAlbum, loadAllAlbums } from "./db.js";

// === DOM ELEMENTS ===
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
const toggleBgBtn = document.getElementById("toggleBgBtn");

let tracks = {}; // { albumName: [ {name, file, type, added} ] }
let currentAlbum = null;
let currentTrack = null;
let isRepeating = false;

let audioCtx;
let analyser;
let sourceNode;
let animationFrame;

// === BACKGROUND TOGGLE ===
toggleBgBtn.addEventListener("click", () => {
  document.body.classList.toggle("still-mode");
  toggleBgBtn.textContent =
    document.body.classList.contains("still-mode")
      ? "🎥 Switch to Video"
      : "🎬 Switch to Still";
});

// === VISUALIZER ===
function startVisualizer() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sourceNode = audioCtx.createMediaElementSource(mediaElement);
    analyser = audioCtx.createAnalyser();
    sourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 64;
  }

  if (animationFrame) return; // already running

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
      ctx.fillRect(i * barWidth, visualizer.height - height, barWidth - 1, height);
    }
  }

  draw();
}

function stopVisualizer() {
  cancelAnimationFrame(animationFrame);
  animationFrame = null;
}

// === PLAYER ===
playBtn.addEventListener("click", () => {
  if (mediaElement.paused) {
    mediaElement.play().then(() => {
      playBtn.textContent = "⏸️";
      startVisualizer();
    });
  } else {
    mediaElement.pause();
    playBtn.textContent = "▶️";
    stopVisualizer();
  }
});

repeatBtn.addEventListener("click", () => {
  isRepeating = !isRepeating;
  repeatBtn.textContent = isRepeating ? "🔁 ON" : "🔁";
});

mediaElement.addEventListener("ended", () => {
  if (isRepeating && currentTrack) {
    playTrack(currentTrack);
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

function playTrack(track) {
  currentTrack = track;
  nowPlaying.textContent = `🎶 ${track.name}`;
  const objectURL = URL.createObjectURL(track.file);
  mediaElement.src = objectURL;
  mediaElement.load();
  mediaElement.play();
  playBtn.textContent = "⏸️";
  startVisualizer();
  document.getElementById("playerSection").classList.remove("hidden");
}

function renderTracks(album) {
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
    play.addEventListener("click", () => playTrack(track));

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
      renderTracks(album);
    });

    actions.append(play, download, del);
    div.append(title, actions);
    trackList.appendChild(div);
  });
}

uploadBtn.addEventListener("click", () => {
  if (!currentAlbum) {
    alert("Please create or select an album first.");
    return;
  }
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
      tracks[currentAlbum].push({ name: file.name, file });
    }
  });
  await saveAlbum(currentAlbum, tracks[currentAlbum]);
  renderTracks(currentAlbum);
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
    renderTracks(name);
  } else {
    alert("Album already exists!");
  }
});

albumSelect.addEventListener("change", () => {
  currentAlbum = albumSelect.value;
  renderTracks(currentAlbum);
});

window.addEventListener("DOMContentLoaded", async () => {
  await initDB();
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
    renderTracks(currentAlbum);
  }
});