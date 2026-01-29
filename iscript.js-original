const video = document.getElementById('video');
const ytPlayer = document.getElementById('ytPlayer');
const spinner = document.getElementById('spinnerOverlay');
const channelList = document.getElementById('channelList');
const fullscreenBtn = document.getElementById('fullscreenBtn');

const player = new shaka.Player(video);

let channels = [];
let focusedIndex = 0;

function showSpinner() { spinner.style.display = 'flex'; }
function hideSpinner() { spinner.style.display = 'none'; }

async function loadChannels() {
  const res = await fetch('onechannel.json');
  channels = await res.json();
  renderChannels();
}

function renderChannels() {
  channelList.innerHTML = '';

  channels.forEach((ch, i) => {
    const div = document.createElement('div');
    div.className = 'channel';
    div.innerHTML = `<img src="${ch.logo}"><span>${ch.name}</span>`;
    div.onclick = () => playChannel(ch, div);
    channelList.appendChild(div);
  });

  const items = document.querySelectorAll('.channel');
  items[0].classList.add('focused');
  playChannel(channels[0], items[0]);
}

async function playChannel(ch, el) {
  document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  showSpinner();

  if (ch.type === 'youtube') {
    video.pause();
    video.style.display = 'none';
    ytPlayer.style.display = 'block';
    ytPlayer.src = `https://www.youtube.com/embed/${ch.videoId}?autoplay=1&controls=1&rel=0`;
    hideSpinner();
    return;
  }

  ytPlayer.style.display = 'none';
  ytPlayer.src = '';
  video.style.display = 'block';

  try {
    if (ch.type === 'dash' && ch.clearKey) {
      player.configure({ drm: { clearKeys: ch.clearKey } });
    }
    await player.load(ch.manifestUri);
  } catch (e) {
    console.error('Playback error', e);
  } finally {
    hideSpinner();
  }
}

fullscreenBtn.onclick = () => {
  const el = ytPlayer.style.display === 'block' ? ytPlayer : video;
  if (!document.fullscreenElement) el.requestFullscreen();
  else document.exitFullscreen();
};

document.addEventListener('keydown', e => {
  const items = document.querySelectorAll('.channel');
  if (e.key === 'ArrowDown') focusedIndex = Math.min(items.length - 1, focusedIndex + 1);
  if (e.key === 'ArrowUp') focusedIndex = Math.max(0, focusedIndex - 1);
  if (e.key === 'Enter') items[focusedIndex].click();

  items.forEach(i => i.classList.remove('focused'));
  items[focusedIndex].classList.add('focused');
  items[focusedIndex].scrollIntoView({ block: 'nearest' });
});

loadChannels();
