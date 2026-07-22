/** 游戏状态管理 — 全局函数版 */

const STORAGE_KEY = 'mistyTownGameState';
const SETTINGS_KEY = 'mistyTownSettings';

function createInitialState() {
  return {
    currentChapter: 1,
    currentNode: 0,
    clues: [],
    suspicion: 0,
    npcRelations: {
      警长: 50,
      酒馆老板娘: 50,
      神秘老人: 50
    },
    choices: [],
    ending: null,
    storyHistory: [],
    summaries: [],
    processLog: []
  };
}

function loadGameState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }
  return createInitialState();
}

function saveGameState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function resetGameState() {
  const state = createInitialState();
  saveGameState(state);
  return state;
}

function loadSettings() {
  return {
    apiKey: localStorage.getItem('apiKey') || '',
    apiBaseUrl: localStorage.getItem('apiBaseUrl') || 'https://api.openai.com/v1',
    model: localStorage.getItem('model') || 'gpt-4o-mini'
  };
}

function saveSettings({ apiKey, apiBaseUrl, model }) {
  localStorage.setItem('apiKey', apiKey);
  localStorage.setItem('apiBaseUrl', apiBaseUrl);
  localStorage.setItem('model', model);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ apiKey, apiBaseUrl, model }));
}

function hasApiKey() {
  return Boolean(localStorage.getItem('apiKey'));
}

function applyChoice(state, choice) {
  state.choices.push(choice.text);

  if (choice.suspicionDelta) {
    state.suspicion = clamp(state.suspicion + choice.suspicionDelta, 0, 100);
  }

  if (choice.clue && !state.clues.includes(choice.clue)) {
    state.clues.push(choice.clue);
  }

  if (choice.npc && choice.relationDelta) {
    const npc = choice.npc;
    if (state.npcRelations[npc] !== undefined) {
      state.npcRelations[npc] = clamp(
        state.npcRelations[npc] + choice.relationDelta,
        0,
        100
      );
    }
  }

  state.currentNode += 1;

  // 每 4 个节点推进一章，让 16 个节点覆盖第 1~4 章
  if (state.currentNode > 0 && state.currentNode % 4 === 0 && state.currentChapter < 5) {
    state.currentChapter += 1;
  }

  saveGameState(state);
  return state;
}

function recordStoryNode(state, node) {
  state.storyHistory.push({
    sceneDescription: node.sceneDescription,
    narration: node.narration,
    choices: node.choices?.map((c) => c.text),
    selectedChoice: null
  });

  if (state.storyHistory.length > 6) {
    const removed = state.storyHistory.splice(0, 3);
    const summary = removed.map((n) => `${n.sceneDescription}：${n.narration?.slice(0, 60) || ''}`).join('；');
    state.summaries.push(summary.slice(0, 200));
  }

  saveGameState(state);
}

function getLastStoryNode(state) {
  if (!state.storyHistory || state.storyHistory.length === 0) return null;
  return state.storyHistory[state.storyHistory.length - 1];
}

function recordSelectedChoice(state, choiceText) {
  if (!state.storyHistory || state.storyHistory.length === 0) return;
  const last = state.storyHistory[state.storyHistory.length - 1];
  if (last && !last.selectedChoice) {
    last.selectedChoice = choiceText;
    saveGameState(state);
  }
}

function shouldTriggerEnding(state) {
  return state.currentChapter >= 5 || state.currentNode >= DEMO_NODES.length;
}

function determineEndingType(state) {
  const { suspicion, clues, choices, npcRelations } = state;

  // 好感度结局：任一 NPC 好感度达到 80 且嫌疑度不太高时触发
  const hasHighRelation = npcRelations && Object.values(npcRelations).some((v) => v >= 80);
  if (hasHighRelation && suspicion < 60) return 'friendship';

  const hasSpecialClue = SPECIAL_CLUES.some((c) => clues.includes(c));
  const hasSpecialPattern = SPECIAL_CHOICE_PATTERN.every((p) =>
    choices.some((c) => c.includes(p))
  );

  if (hasSpecialClue && clues.includes('共生契约')) return 'special';
  if (hasSpecialClue && clues.includes('古老符文')) return 'hidden';
  if (suspicion > 70) return 'bad';
  if (suspicion < 30) return 'good';
  return 'neutral';
}

function calculateGrade(clueCount) {
  if (clueCount >= 9) return 'S';
  if (clueCount >= 7) return 'A';
  if (clueCount >= 5) return 'B';
  if (clueCount >= 3) return 'C';
  return 'D';
}

function getDemoNode(state) {
  const index = Math.min(state.currentNode, DEMO_NODES.length);
  if (index >= DEMO_NODES.length) return null;
  return DEMO_NODES[index];
}

function getDemoEnding(type) {
  return DEMO_ENDINGS[type] || DEMO_ENDINGS.neutral;
}

function getEndingMeta(type) {
  return ENDING_META[type] || ENDING_META.neutral;
}

function finalizeEnding(state, endingType, endingNarration) {
  state.ending = {
    type: endingType,
    grade: calculateGrade(state.clues.length),
    title: getEndingMeta(endingType).title,
    narration: endingNarration
  };
  saveGameState(state);
  return state;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function recordProcessStep(state, node, choice, clueDelta, suspicionDelta) {
  if (!state.processLog) state.processLog = [];

  const sceneTitle = node?.sceneDescription || '未知场景';
  const narrationSummary = node?.narration
    ? node.narration.slice(0, 80).replace(/\s+/g, '') + (node.narration.length > 80 ? '……' : '')
    : '';

  const explanations = [];
  if (clueDelta > 0) explanations.push(`你在「${sceneTitle}」中通过「${choice.text}」发现了新线索「${choice.clue}」。`);
  if (suspicionDelta > 0) explanations.push('你的举动让镇民起疑，嫌疑度上升。');
  if (suspicionDelta < 0) explanations.push('你的应对降低了镇民的戒心，嫌疑度下降。');
  if (choice.npc && choice.relationDelta) {
    const relationText = choice.relationDelta > 0 ? '提升' : '下降';
    explanations.push(`你与${choice.npc}的关系${relationText}了 ${Math.abs(choice.relationDelta)} 点。`);
  }

  state.processLog.push({
    round: state.processLog.length + 1,
    sceneTitle,
    narrationSummary,
    choiceText: choice.text,
    clueDelta,
    suspicionDelta,
    clueName: choice.clue || null,
    npc: choice.npc || null,
    relationDelta: choice.relationDelta || 0,
    explanation: explanations.join('') || '这个选择没有明显改变现状。'
  });

  saveGameState(state);
}

function getProcessLog() {
  const state = loadGameState();
  return state.processLog || [];
}
