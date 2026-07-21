/** UI 渲染与交互 — 全局函数版 */

let typewriterTimer = null;
let typewriterSkipHandler = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function showScreen(name) {
  $$('.screen').forEach((el) => el.classList.remove('active'));
  const screen = $(`#screen-${name}`);
  if (screen) screen.classList.add('active');
}

function showLoading(show) {
  const overlay = $('#loading-overlay');
  overlay?.classList.toggle('hidden', !show);
}

function updateStatusBar(state) {
  const chapterInfo = getChapterInfo(state.currentChapter);
  $('#status-chapter').textContent = `第${state.currentChapter}章`;
  $('#status-clues').textContent = state.clues.length;
  $('#status-suspicion').textContent = state.suspicion;
}

function showClueToast(clueName) {
  const toast = $('#clue-toast');
  const text = $('#clue-text');
  if (!toast || !text) return;

  text.textContent = `获得线索：${clueName}`;
  toast.className = 'clue-toast';

  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function showSuspicionToast(delta) {
  const toast = $('#suspicion-toast');
  const text = $('#suspicion-text');
  if (!toast || !text) return;

  const sign = delta > 0 ? '+' : '';
  const suffix = delta > 0 ? '上升' : '下降';
  text.textContent = `嫌疑度${suffix} ${sign}${Math.abs(delta)}`;
  toast.className = delta >= 0 ? 'suspicion-toast' : 'suspicion-toast decrease';

  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function renderSceneImage(node) {
  const img = $('#scene-image');
  if (!img) return;

  img.classList.add('fade-out');
  setTimeout(() => {
    img.src = resolveSceneImage(node);
    img.alt = node.sceneDescription || '场景';
    img.classList.remove('fade-out');
  }, 300);
}

function renderPortrait(portraitName) {
  const container = $('#portrait-container');
  const img = $('#portrait-image');
  if (!container || !img) return;

  if (portraitName && PORTRAITS[portraitName]) {
    img.src = PORTRAITS[portraitName];
    img.alt = portraitName;
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
}

function renderStoryNode(node, onChoice, onTypewriterDone) {
  $('#scene-description').textContent = node.sceneDescription || '';
  renderSceneImage(node);
  renderPortrait(node.portrait);

  typewriterEffect(node.narration || '', () => {
    renderChoices(node.choices || [], onChoice);
    onTypewriterDone?.();
  });
}

function renderChoices(choices, onChoice) {
  const area = $('#choices-area');
  if (!area) return;
  area.innerHTML = '';

  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'btn-choice';
    btn.textContent = `${index + 1}. ${choice.text}`;
    btn.addEventListener('click', () => {
      $$('.btn-choice').forEach((b) => (b.disabled = true));
      onChoice(choice);
    });
    area.appendChild(btn);
  });
}

function typewriterEffect(text, onComplete) {
  stopTypewriter();

  const el = $('#narration-text');
  const cursor = $('#typewriter-cursor');
  if (!el) return;

  el.textContent = '';
  cursor?.classList.remove('hidden');

  let index = 0;
  const speed = 35;

  const finish = () => {
    stopTypewriter();
    el.textContent = text;
    cursor?.classList.add('hidden');
    onComplete?.();
  };

  typewriterSkipHandler = finish;
  $('#narration-box')?.addEventListener('click', typewriterSkipHandler, { once: true });

  typewriterTimer = setInterval(() => {
    if (index < text.length) {
      el.textContent += text[index];
      index += 1;
    } else {
      finish();
    }
  }, speed);
}

function stopTypewriter() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  if (typewriterSkipHandler) {
    $('#narration-box')?.removeEventListener('click', typewriterSkipHandler);
    typewriterSkipHandler = null;
  }
}

function renderEnding(state) {
  const ending = state.ending;
  if (!ending) return;

  const meta = getEndingMeta(ending.type);
  const gradeEl = $('#ending-grade');
  gradeEl.textContent = ending.grade;
  gradeEl.className = `ending-grade grade-${ending.grade.toLowerCase()}`;

  $('#ending-title').textContent = ending.title || meta.title;
  $('#ending-type-label').textContent = meta.label;
  $('#ending-text').textContent = ending.narration;
  $('#ending-clues').textContent = state.clues.length;
  $('#ending-suspicion').textContent = state.suspicion;

  showScreen('ending');
}

function loadSettingsForm(settings) {
  $('#input-api-key').value = settings.apiKey;
  $('#input-base-url').value = settings.apiBaseUrl;
  $('#select-model').value = settings.model;
}

function getSettingsFormValues() {
  return {
    apiKey: $('#input-api-key').value.trim(),
    apiBaseUrl: $('#input-base-url').value.trim() || 'https://api.openai.com/v1',
    model: $('#select-model').value
  };
}

async function shareEnding() {
  const content = $('#screen-ending');
  if (!content) return;

  try {
    if (navigator.share) {
      await navigator.share({
        title: `迷雾小镇 — ${$('#ending-title')?.textContent}`,
        text: `${$('#ending-text')?.textContent?.slice(0, 100)}...`
      });
    } else {
      await navigator.clipboard.writeText(
        `《迷雾小镇》结局：${$('#ending-title')?.textContent}\n评级：${$('#ending-grade')?.textContent}\n\n${$('#ending-text')?.textContent}`
      );
      alert('结局文字已复制到剪贴板');
    }
  } catch {
    /* 用户取消分享 */
  }
}

function disableChoices() {
  $$('.btn-choice').forEach((b) => (b.disabled = true));
}

function clearChoices() {
  const area = $('#choices-area');
  if (area) area.innerHTML = '';
}

function showApiTestResult(status, message) {
  const el = $('#api-test-result');
  if (!el) return;
  el.className = `api-test-result ${status}`;
  el.textContent = message;
}

function hideApiTestResult() {
  const el = $('#api-test-result');
  if (!el) return;
  el.className = 'api-test-result hidden';
  el.textContent = '';
}

function openProcessModal() {
  renderProcessModal();
  const modal = $('#process-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeProcessModal() {
  const modal = $('#process-modal');
  if (modal) modal.classList.add('hidden');
}

function renderProcessModal() {
  const content = $('#process-content');
  if (!content) return;

  const log = getProcessLog();
  if (log.length === 0) {
    content.innerHTML = '<p class="process-empty">暂无调查记录</p>';
    return;
  }

  content.innerHTML = log.map((step) => {
    const effects = [];
    if (step.clueDelta > 0) {
      effects.push(`<span class="effect-clue">+线索：${step.clueName || '未知线索'}</span>`);
    }
    if (step.suspicionDelta !== 0) {
      const sign = step.suspicionDelta > 0 ? '+' : '';
      effects.push(`<span class="effect-suspicion">嫌疑度 ${sign}${step.suspicionDelta}</span>`);
    }
    if (step.npc && step.relationDelta !== 0) {
      const sign = step.relationDelta > 0 ? '+' : '';
      effects.push(`<span class="effect-suspicion">${step.npc} 好感 ${sign}${step.relationDelta}</span>`);
    }

    return `
      <div class="process-step">
        <div class="round">第 ${step.round} 轮 · ${step.sceneTitle || '未知场景'}</div>
        <div class="process-scene-summary">${step.narrationSummary || ''}</div>
        <div class="choice">你选择了：${step.choiceText}</div>
        <div class="effects">${effects.join('')}</div>
        <div class="effect-explain">${step.explanation}</div>
      </div>
    `;
  }).join('');
}

function renderHistoryModal() {
  const content = $('#history-content');
  if (!content) return;

  const state = loadGameState();
  const history = state.storyHistory || [];

  if (history.length === 0) {
    content.innerHTML = '<p class="process-empty">暂无历史对话</p>';
    return;
  }

  content.innerHTML = history.map((node, index) => {
    const choiceText = node.selectedChoice
      ? `<div class="history-choice">你选择了：${node.selectedChoice}</div>`
      : '';

    return `
      <div class="process-step history-step">
        <div class="round">第 ${index + 1} 幕 · ${node.sceneDescription || '未知场景'}</div>
        <div class="history-narration">${node.narration || ''}</div>
        ${choiceText}
      </div>
    `;
  }).join('');
}
