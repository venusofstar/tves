// Polyfills for Shaka Player
shaka.polyfill.installAll();

// Check if browser supports Shaka Player
if (!shaka.Player.isBrowserSupported()) {
  alert("Browser not supported for Shaka Player!");
}

const video = document.getElementById("video");
const ytPlayer = document.getElementById("ytPlayer");
const spinner = document.getElementById("spinnerOverlay");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const player = new shaka.Player(video);

// Show / Hide spinner
function showSpinner() { spinner.style.display = "flex"; }
function hideSpinner() { spinner.style.display = "none"; }

// Load single channel from JSON
async function loadChannel() {
  try {
    const res = await fetch("onechannel.json");
    if (!res.ok) throw new Error("Failed to fetch onechannel.json");
    const channel = await res.json();
    playChannel(channel);
  } catch (err) {
    console.error("Error loading channel:", err);
    alert("Cannot load onechannel.json. Make sure you run this via HTTP server!");
  }
}

// Play the channel
async function playChannel(ch) {
  showSpinner();

  // Handle YouTube channel
  if (ch.type === "youtube") {
    video.pause();
    video.style.display = "none";
    ytPlayer.style.display = "block";
    ytPlayer.src = `https://www.youtube.com/embed/${ch.videoId}?autoplay=1&controls=1&rel=0`;
    hideSpinner();
    return;
  }

  // Handle DASH / HLS
  ytPlayer.style.display = "none";
  ytPlayer.src = "";
  video.style.display = "block";

  try {
    // Configure DRM for DASH if present
    if (ch.type === "dash" && ch.clearKey) {
      player.configure({ drm: { clearKeys: ch.clearKey } });
    }

    // Load stream
    await player.load(ch.manifestUri);
    console.log("Now playing:", ch.name);
  } catch (err) {
    console.error("Playback error:", err);
    alert(`Cannot play ${ch.name}. Check console for details.`);
  } finally {
    hideSpinner();
  }
}

// Fullscreen button
fullscreenBtn.onclick = () => {
  const el = ytPlayer.style.display === "block" ? ytPlayer : video;
  if (!document.fullscreenElement) el.requestFullscreen();
  else document.exitFullscreen();
};

// Show spinner on waiting, hide on playing
video.addEventListener("waiting", showSpinner);
video.addEventListener("playing", hideSpinner);

// Load channel at startup
loadChannel();
