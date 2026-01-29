// Polyfills for Shaka Player
shaka.polyfill.installAll();

// Check if browser supports Shaka Player
if (!shaka.Player.isBrowserSupported()) {
  alert("Browser not supported for Shaka Player!");
}

const video = document.getElementById("video");
const ytPlayer = document.getElementById("ytPlayer");
const spinner = document.getElementById("spinnerOverlay");
const channelList = document.getElementById("channelList");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const player = new shaka.Player(video);

let channels = [];
let focusedIndex = 0;

// Show / Hide spinner
function showSpinner() { spinner.style.display = "flex"; }
function hideSpinner() { spinner.style.display = "none"; }

// Load channels from JSON
async function loadChannels() {
  try {
    const res = await fetch("onechannel.json");
    if (!res.ok) throw new Error("Failed to fetch onechannel.json");
    channels = await res.json();
    renderChannels();
  } catch (err) {
    console.error("Error loading channels:", err);
    alert("Cannot load onechannel.json. Make sure you run this via HTTP server!");
  }
}

// Render channels in sidebar
function renderChannels() {
  channelList.innerHTML = "";
  channels.forEach((ch, i) => {
    const div = document.createElement("div");
    div.className = "channel";
    div.innerHTML = `<img src="${ch.logo}" alt="${ch.name}"><span>${ch.name}</span>`;
    div.tabIndex = 0; // make focusable
    div.onclick = () => playChannel(ch, div);
    channelList.appendChild(div);
  });

  if (channels.length > 0) {
    focusedIndex = 0;
    const firstDiv = channelList.children[0];
    firstDiv.classList.add("focused");
    playChannel(channels[0], firstDiv);
  }
}

// Play selected channel
async function playChannel(ch, el) {
  // Highlight active channel
  document.querySelectorAll(".channel").forEach(c => c.classList.remove("active"));
  el.classList.add("active");

  showSpinner();

  try {
    if (ch.type === "youtube") {
      // YouTube embed
      video.pause();
      video.style.display = "none";
      ytPlayer.style.display = "block";
      ytPlayer.src = `https://www.youtube.com/embed/${ch.videoId}?autoplay=1&controls=1&rel=0`;
    } else {
      // DASH / HLS playback
      ytPlayer.style.display = "none";
      ytPlayer.src = "";
      video.style.display = "block";

      // DRM for DASH if present
      if (ch.type === "dash" && ch.clearKey) {
        player.configure({ drm: { clearKeys: ch.clearKey } });
      }

      await player.load(ch.manifestUri);
      console.log("Now playing:", ch.name);
    }
  } catch (err) {
    console.error("Playback error:", err);
    alert(`Cannot play ${ch.name}. Check console for details.`);
  } finally {
    hideSpinner();
  }
}

// Keyboard navigation
document.addEventListener("keydown", e => {
  const items = document.querySelectorAll(".channel");
  if (!items.length) return;

  if (e.key === "ArrowDown") focusedIndex = Math.min(items.length - 1, focusedIndex + 1);
  if (e.key === "ArrowUp") focusedIndex = Math.max(0, focusedIndex - 1);
  if (e.key === "Enter") items[focusedIndex].click();

  items.forEach(i => i.classList.remove("focused"));
  items[focusedIndex].classList.add("focused");
  items[focusedIndex].scrollIntoView({ block: "nearest" });
});

// Fullscreen button
fullscreenBtn.onclick = () => {
  const el = ytPlayer.style.display === "block" ? ytPlayer : video;
  if (!document.fullscreenElement) el.requestFullscreen().catch(err => console.error(err));
  else document.exitFullscreen().catch(err => console.error(err));
};

// Spinner on waiting / playing
video.addEventListener("waiting", showSpinner);
video.addEventListener("playing", hideSpinner);

// Load channels at startup
loadChannels();
