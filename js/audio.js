/** 背景音乐 — 使用本地 MP3 文件循环播放 */

const AudioEngine = (function () {
  let audioEl = null;
  let isMuted = false;
  let isPlaying = false;
  const BGM_PATH = 'assets/audio/bgm.mp3';

  function play() {
    if (isPlaying && !isMuted) return;

    if (!audioEl) {
      audioEl = new Audio(BGM_PATH);
      audioEl.loop = true;
      audioEl.volume = 0.5;
    }

    audioEl.play().then(() => {
      isPlaying = true;
      isMuted = false;
      updateIcon();
    }).catch((err) => {
      console.warn('BGM 播放失败（浏览器可能阻止自动播放）:', err.message);
      isMuted = true;
      updateIcon();
    });
  }

  function stop() {
    if (!audioEl) return;
    audioEl.pause();
    audioEl.currentTime = 0;
    isPlaying = false;
    updateIcon();
  }

  function toggleMute() {
    if (!audioEl) {
      play();
      return;
    }
    if (isMuted) {
      audioEl.play().then(() => {
        isMuted = false;
        isPlaying = true;
        updateIcon();
      }).catch(() => {});
    } else {
      audioEl.pause();
      isMuted = true;
      updateIcon();
    }
  }

  function updateIcon() {
    const btn = document.getElementById('btn-audio-toggle');
    if (!btn) return;
    btn.textContent = isMuted || !isPlaying ? '🔇' : '🔊';
    btn.title = isMuted || !isPlaying ? '已静音，点击开启声音' : '点击静音';
  }

  return {
    play,
    stop,
    toggleMute,
    get isPlaying() { return isPlaying; }
  };
})();

function createAudioToggleButton() {
  if (document.getElementById('btn-audio-toggle')) return;
  const btn = document.createElement('button');
  btn.id = 'btn-audio-toggle';
  btn.className = 'btn-icon';
  btn.setAttribute('aria-label', '声音开关');
  btn.textContent = '🔇';
  btn.title = '点击开启背景音乐';
  btn.style.position = 'fixed';
  btn.style.top = '16px';
  btn.style.right = '56px';
  btn.style.zIndex = '100';
  btn.addEventListener('click', () => {
    if (!AudioEngine.isPlaying) {
      AudioEngine.play();
    } else {
      AudioEngine.toggleMute();
    }
  });
  document.body.appendChild(btn);
}

// 启动界面第一次交互后尝试播放（浏览器 autoplay 策略要求用户交互）
function initAudioOnInteraction() {
  createAudioToggleButton();
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      AudioEngine.play();
    }, { once: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAudioOnInteraction);
} else {
  initAudioOnInteraction();
}
