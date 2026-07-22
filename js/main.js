/** 主逻辑入口 — 全局函数版 */

let gameState = loadGameState();
let isProcessing = false;
let previousScreen = 'start';

function init() {
  bindEvents();
  bindDialogueClick();
  loadSettingsForm(loadSettings());
}

function bindEvents() {
  document.getElementById('btn-start')?.addEventListener('click', startGame);
  document.getElementById('btn-restart')?.addEventListener('click', restartGame);
  document.getElementById('btn-view-process')?.addEventListener('click', openProcessModal);
  document.getElementById('btn-close-process')?.addEventListener('click', hideProcessModal);
  document.getElementById('btn-history')?.addEventListener('click', openHistoryModal);
  document.getElementById('btn-close-history')?.addEventListener('click', hideHistoryModal);
  document.getElementById('btn-save-settings')?.addEventListener('click', handleSaveSettings);
  document.getElementById('btn-close-settings')?.addEventListener('click', handleCloseSettings);
  document.getElementById('btn-test-api')?.addEventListener('click', handleTestApi);

  document.querySelectorAll('.settings-trigger').forEach((btn) => {
    btn.addEventListener('click', openSettings);
  });
}

/** 对话框点击 → 逐句推进 */
function bindDialogueClick() {
  const dialogueBox = document.getElementById('dialogue-box');
  if (dialogueBox) {
    dialogueBox.addEventListener('click', () => {
      // 正在打字 → 点击完成当前句
      // 不在打字且还有句子 → 显示下一句
      // 句子播完 → 显示选项
      showNextSentence();
    });
  }
}

function hideProcessModal() {
  closeProcessModal();
}

function openHistoryModal() {
  renderHistoryModal();
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.remove('hidden');
}

function hideHistoryModal() {
  const modal = document.getElementById('history-modal');
  if (modal) modal.classList.add('hidden');
}

function handleCloseSettings() {
  showScreen(previousScreen || 'start');
}

async function handleTestApi() {
  const values = getSettingsFormValues();
  showApiTestResult('loading', '正在测试连接，请稍候……');

  try {
    const result = await testApiConnection(values);
    showApiTestResult(
      'success',
      `✅ 连接成功\n模型：${result.model}\n测试回复：${result.content}`
    );
  } catch (err) {
    showApiTestResult(
      'error',
      `❌ 连接失败\n${err.message}`
    );
  }
}

function openSettings() {
  const active = document.querySelector('.screen.active');
  previousScreen = active?.id?.replace('screen-', '') || 'start';
  loadSettingsForm(loadSettings());
  showScreen('settings');
}

function handleSaveSettings() {
  const values = getSettingsFormValues();
  saveSettings(values);
  alert('设置已保存');
  showScreen(previousScreen || 'start');
}

async function startGame() {
  gameState = resetGameState();
  showScreen('game');
  updateStatusBar(gameState);
  clearChoices();
  await loadNextNode(null);
}

function restartGame() {
  gameState = resetGameState();
  showScreen('start');
}

async function loadNextNode(playerChoice) {
  if (isProcessing) return;
  isProcessing = true;
  showLoading(true);
  disableChoices();

  let pendingClue = null;
  let pendingSuspicionDelta = 0;

  try {
    if (playerChoice) {
      const prevClueCount = gameState.clues.length;
      const prevSuspicion = gameState.suspicion;
      const currentNode = getLastStoryNode(gameState);
      applyChoice(gameState, playerChoice);
      updateStatusBar(gameState);

      const clueDelta = gameState.clues.length - prevClueCount;
      pendingSuspicionDelta = gameState.suspicion - prevSuspicion;

      if (playerChoice.clue && clueDelta > 0) {
        pendingClue = playerChoice.clue;
      }

      recordProcessStep(gameState, currentNode, playerChoice, clueDelta, pendingSuspicionDelta);
      recordSelectedChoice(gameState, playerChoice.text);
    }

    if (shouldTriggerEnding(gameState)) {
      await triggerEnding();
      return;
    }

    let node;

    if (hasApiKey()) {
      try {
        node = await generateStoryNode(gameState, playerChoice?.text);
      } catch (err) {
        console.warn('AI 生成失败，回退到演示剧情:', err.message);
        node = getDemoNode(gameState);
      }
    } else {
      node = getDemoNode(gameState);
    }

    if (!node) {
      await triggerEnding();
      return;
    }

    recordStoryNode(gameState, node);
    showLoading(false);

    renderStoryNode(node, handleChoice, () => {
      isProcessing = false;
    });

    showPendingToasts(pendingClue, pendingSuspicionDelta);
  } catch (err) {
    showLoading(false);
    isProcessing = false;
    console.error(err);
    alert(`剧情加载失败：${err.message}`);
  }
}

function showPendingToasts(clue, suspicionDelta) {
  if (clue) {
    showClueToast(clue);
  }
  if (suspicionDelta !== 0) {
    showSuspicionToast(suspicionDelta);
  }
}

async function handleChoice(choice) {
  await loadNextNode(choice);
}

async function triggerEnding() {
  showLoading(true);

  const endingType = determineEndingType(gameState);
  let narration = '';
  let sceneDescription = '';

  if (hasApiKey()) {
    const aiEnding = await generateEndingNarration(gameState);
    if (aiEnding) {
      narration = aiEnding.narration;
      sceneDescription = aiEnding.sceneDescription || '';
    }
  }

  if (!narration) {
    const demo = getDemoEnding(endingType);
    narration = demo.narration;
    sceneDescription = demo.sceneDescription;
  }

  finalizeEnding(gameState, endingType, narration);
  showLoading(false);
  isProcessing = false;
  renderEnding(gameState);
}

init();
