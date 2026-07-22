/** UI 渲染与交互 — Visual Novel 风格 */

let typewriterTimer = null;
let vnState = {
  sentences: [],
  currentSentenceIdx: 0,
  isTyping: false,
  onComplete: null,
  onChoice: null,
  choices: []
};

// 提示系统：每幕选项只能提示一次
let currentSceneNodeIndex = null;
const hintedNodes = new Set();

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

/**
 * 将叙述文字按句号/感叹号/问号分割成句子
 */
function splitSentences(text) {
  if (!text) return [''];
  // 按中文标点分割，保留标点
  const sentences = text.match(/[^。！？…]+[。！？…]*/g);
  return sentences || [text];
}

/**
 * 渲染剧情节点 — VN 逐句模式
 */
function renderStoryNode(node, onChoice, onTypewriterDone) {
  // 场景标签
  $('#scene-label').textContent = node.sceneDescription || '';

  // 场景图 + 立绘
  renderSceneImage(node);
  renderPortrait(node.portrait);

  // 分句
  vnState.sentences = splitSentences(node.narration || '');
  vnState.currentSentenceIdx = 0;
  vnState.choices = node.choices || [];
  vnState.onChoice = onChoice;
  vnState.onComplete = onTypewriterDone;

  // 清空选项区
  const choicesArea = $('#choices-area');
  if (choicesArea) {
    choicesArea.innerHTML = '';
    choicesArea.classList.remove('hints-visible');
  }

  // 开始显示第一句
  showNextSentence();
  updateHintButtonState();
}

function showNextSentence() {
  const el = $('#narration-text');
  const hint = $('#click-hint');
  if (!el) return;

  // 如果正在打字，点击直接完成当前句
  if (vnState.isTyping) {
    finishCurrentSentence();
    return;
  }

  // 所有句子播完 → 显示选项
  if (vnState.currentSentenceIdx >= vnState.sentences.length) {
    hint?.classList.add('hidden');
    renderChoices(vnState.choices, vnState.onChoice);
    vnState.onComplete?.();
    vnState.onComplete = null;
    updateHintButtonState();
    return;
  }

  // 开始打下一句
  const sentence = vnState.sentences[vnState.currentSentenceIdx];
  hint?.classList.add('hidden');

  // 如果是第一句，清空；否则追加
  if (vnState.currentSentenceIdx === 0) {
    el.textContent = '';
  }

  vnState.isTyping = true;
  let charIndex = 0;
  const speed = 30;

  typewriterTimer = setInterval(() => {
    if (charIndex < sentence.length) {
      el.textContent += sentence[charIndex];
      charIndex++;
    } else {
      // 当前句打完
      clearInterval(typewriterTimer);
      typewriterTimer = null;
      vnState.isTyping = false;
      vnState.currentSentenceIdx++;

      // 如果还有下一句，显示"点击继续"
      if (vnState.currentSentenceIdx < vnState.sentences.length) {
        hint?.classList.remove('hidden');
      } else {
        // 最后一句打完，显示提示
        hint?.classList.remove('hidden');
        hint.textContent = '点击继续 ▼';
      }
    }
  }, speed);
}

function finishCurrentSentence() {
  const el = $('#narration-text');
  if (!el) return;

  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }

  // 补全当前句的剩余文字
  const sentence = vnState.sentences[vnState.currentSentenceIdx] || '';
  // 当前已显示的文字中，属于本句的部分
  const previousSentences = vnState.sentences.slice(0, vnState.currentSentenceIdx).join('');
  const currentShown = el.textContent.substring(previousSentences.length);
  const remaining = sentence.substring(currentShown.length);
  el.textContent += remaining;

  vnState.isTyping = false;
  vnState.currentSentenceIdx++;

  const hint = $('#click-hint');
  hint?.classList.remove('hidden');
  hint.textContent = vnState.currentSentenceIdx < vnState.sentences.length ? '点击继续 ▼' : '点击继续 ▼';
}

function stopTypewriter() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
  vnState.isTyping = false;
}

function renderChoices(choices, onChoice) {
  const area = $('#choices-area');
  if (!area) return;
  area.innerHTML = '';
  area.classList.remove('hints-visible');

  choices.forEach((choice, index) => {
    const tags = buildChoiceTags(choice);
    const tagsHtml = tags
      .map((t) => `<span class="choice-tag ${t.class}">${escapeHtml(t.text)}</span>`)
      .join('');

    const btn = document.createElement('button');
    btn.className = 'btn-choice';
    btn.innerHTML = `
      <span class="choice-text">${index + 1}. ${escapeHtml(choice.text)}</span>
      ${tagsHtml ? `<span class="choice-tags">${tagsHtml}</span>` : ''}
    `;
    btn.addEventListener('click', () => {
      $$('.btn-choice').forEach((b) => (b.disabled = true));
      disableHintButton();
      onChoice(choice);
    });
    area.appendChild(btn);
  });

  updateHintButtonState();
}

/**
 * 根据选项的收益/风险自动生成标签
 */
function buildChoiceTags(choice) {
  const tags = [];

  if (choice.suspicionDelta > 5) {
    tags.push({ class: 'risk', text: '⚠ 高风险' });
  } else if (choice.suspicionDelta < 0) {
    tags.push({ class: 'safe', text: '✓ 降低嫌疑' });
  }

  if (choice.clue) {
    tags.push({ class: 'clue', text: '🔍 可能获得线索' });
  }

  if (choice.npc && choice.relationDelta) {
    if (choice.relationDelta >= 5) {
      tags.push({ class: 'relation-up', text: `❤ ${choice.npc}` });
    } else if (choice.relationDelta <= -5) {
      tags.push({ class: 'relation-down', text: `⚠ ${choice.npc}` });
    }
  }

  return tags;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setCurrentSceneNodeIndex(index) {
  currentSceneNodeIndex = index;
}

function updateHintButtonState() {
  const btn = $('#btn-hint');
  if (!btn) return;

  const choicesArea = $('#choices-area');
  const hasChoices = choicesArea && choicesArea.children.length > 0;
  const alreadyHinted = currentSceneNodeIndex !== null && hintedNodes.has(currentSceneNodeIndex);
  btn.disabled = !hasChoices || alreadyHinted;
}

function disableHintButton() {
  const btn = $('#btn-hint');
  if (btn) btn.disabled = true;
}

function handleHintClick() {
  if (currentSceneNodeIndex === null) return;
  if (hintedNodes.has(currentSceneNodeIndex)) return;

  const choicesArea = $('#choices-area');
  if (!choicesArea || choicesArea.children.length === 0) return;

  hintedNodes.add(currentSceneNodeIndex);
  choicesArea.classList.add('hints-visible');
  updateHintButtonState();
}

function bindHintButton() {
  const btn = $('#btn-hint');
  if (btn) btn.addEventListener('click', handleHintClick);
}

function disableChoices() {
  $$('.btn-choice').forEach((b) => (b.disabled = true));
  disableHintButton();
}

function clearChoices() {
  const area = $('#choices-area');
  if (area) {
    area.innerHTML = '';
    area.classList.remove('hints-visible');
  }
  updateHintButtonState();
}

/* ===== 结局 ===== */
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

/* ===== 设置 ===== */
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

/* ===== 弹窗 ===== */
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
