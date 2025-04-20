// === IMPORT DB ===
import { initDB, saveAlbum, loadAllAlbums, deleteAlbum } from "./db.js";
import {
  cleanupObjectURL,
  ProgressTracker,
  handleStorageError,
} from "./utils.js";

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
const progressBar = document.createElement("div");
progressBar.className = "progress-bar";
progressBar.style.display = "none";
document.body.appendChild(progressBar);

let tracks = {}; // { albumName: [ {name, file, type, added} ] }
let currentAlbum = null;
let currentTrack = null;
let isRepeating = false;
let currentObjectURL = null;

let audioCtx;
let analyser;
let sourceNode;
let animationFrame;

// === ERROR HANDLING ===
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

// === MEMORY MANAGEMENT ===
function cleanupCurrentTrack() {
  if (currentObjectURL) {
    cleanupObjectURL(currentObjectURL);
    currentObjectURL = null;
  }
  if (mediaElement.src) {
    mediaElement.src = "";
  }
}

// === PROGRESS TRACKING ===
function updateProgress(progress, total) {
  const percentage = (progress / total) * 100;
  progressBar.style.display = "block";
  progressBar.style.width = `${percentage}%`;
  if (percentage >= 100) {
    setTimeout(() => {
      progressBar.style.display = "none";
    }, 500);
  }
}

// === TRACK MANAGEMENT ===
function playTrack(track) {
  try {
    cleanupCurrentTrack();
    currentTrack = track;
    nowPlaying.textContent = `🎶 ${track.name}`;
    currentObjectURL = URL.createObjectURL(track.file);
    mediaElement.src = currentObjectURL;
    mediaElement.load();
    mediaElement.play();
    playBtn.textContent = "⏸️";
    startVisualizer();
    document.getElementById("playerSection").classList.remove("hidden");
  } catch (error) {
    showError("Error playing track: " + error.message);
  }
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
      cleanupObjectURL(url);
    });

    const del = document.createElement("button");
    del.textContent = "🗑";
    del.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this track?")) {
        try {
          tracks[album].splice(index, 1);
          await saveAlbum(album, tracks[album]);
          renderTracks(album);
        } catch (error) {
          showError("Error deleting track: " + error.message);
        }
      }
    });

    actions.append(play, download, del);
    div.append(title, actions);
    trackList.appendChild(div);
  });
}

// === EVENT HANDLERS ===
uploadBtn.addEventListener("click", () => {
  if (!currentAlbum) {
    showError("Please create or select an album first.");
    return;
  }
  fileInput.click();
});

fileInput.addEventListener("change", async (e) => {
  try {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) => file.type.startsWith("audio/") || file.type.startsWith("video/")
    );

    if (validFiles.length === 0) {
      showError("No valid audio or video files selected.");
      return;
    }

    const progressTracker = new ProgressTracker(validFiles.length);
    progressTracker.onProgress(updateProgress);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      tracks[currentAlbum].push({ name: file.name, file });
      progressTracker.update(i + 1);
    }

    await saveAlbum(currentAlbum, tracks[currentAlbum]);
    renderTracks(currentAlbum);
    fileInput.value = "";
  } catch (error) {
    showError("Error uploading files: " + error.message);
  }
});

newAlbumBtn.addEventListener("click", () => {
  const name = prompt("Enter new album name:");
  if (!name) return;

  // Basic validation
  if (!name.trim()) {
    showError("Album name cannot be empty.");
    return;
  }

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
    showError("Album already exists!");
  }
});

albumSelect.addEventListener("change", () => {
  currentAlbum = albumSelect.value;
  renderTracks(currentAlbum);
});

// === INITIALIZATION ===
async function initialize() {
  try {
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
  } catch (error) {
    showError("Error initializing application: " + error.message);
  }
}

initialize();

// === CLEANUP ===
window.addEventListener("beforeunload", () => {
  cleanupCurrentTrack();
});

// === BACKGROUND TOGGLE ===
toggleBgBtn.addEventListener("click", () => {
  document.body.classList.toggle("still-mode");
  toggleBgBtn.textContent = document.body.classList.contains("still-mode")
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

// === BACKGROUND MODE LOAD + SELECT ===
const bgModeSelect = document.getElementById("bgMode");
const savedMode = localStorage.getItem("bgMode") || "video";
document.body.classList.add(`${savedMode}-mode`);
bgModeSelect.value = savedMode;

bgModeSelect.addEventListener("change", () => {
  document.body.classList.remove("video-mode", "image-mode", "color-mode");
  const mode = bgModeSelect.value;
  document.body.classList.add(`${mode}-mode`);
  localStorage.setItem("bgMode", mode);
});

// === COLOR PICKER ===
const colorPicker = document.getElementById("colorPicker");
const savedColor = localStorage.getItem("bgColor") || "#111111";
document.documentElement.style.setProperty("--bg-color", savedColor);
colorPicker.value = savedColor;

colorPicker.addEventListener("input", () => {
  const color = colorPicker.value;
  document.documentElement.style.setProperty("--bg-color", color);
  localStorage.setItem("bgColor", color);
});

// === IMAGE UPLOAD ===
const imageUploader = document.getElementById("imageUploader");
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

// === VIDEO UPLOAD ===
const videoUploader = document.getElementById("videoUploader");
const bgVideo = document.getElementById("backgroundVideo");

const storedVideo = localStorage.getItem("customVideo");
if (storedVideo) {
  bgVideo.src = storedVideo;
  bgVideo.load();
  bgVideo.play();
}

videoUploader.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    bgVideo.src = url;
    bgVideo.load();
    bgVideo.play();
    localStorage.setItem("customVideo", url);

    document.body.classList.remove("image-mode", "color-mode");
    document.body.classList.add("video-mode");
    bgModeSelect.value = "video";
  }
});
