/** AI API 调用与 Prompt 工程 — 全局函数版 */

function getAIConfig() {
  return {
    apiKey: localStorage.getItem('apiKey') || '',
    baseUrl: (localStorage.getItem('apiBaseUrl') || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: localStorage.getItem('model') || 'gpt-4o-mini'
  };
}

function buildSystemPrompt(state, isEnding) {
  const chapterInfo = getChapterInfo(state.currentChapter);

  return `你是一个悬疑文字冒险游戏的剧情生成AI。

【角色设定】
你正在为玩家生成一个叫《迷雾小镇》的悬疑冒险游戏剧情。玩家扮演一名外来侦探，调查小镇上一起离奇的失踪案。

【你的任务】
根据当前游戏状态和玩家的选择，生成${isEnding ? '最终结局' : '下一段剧情'}，并以JSON格式输出。

【输出格式要求】
必须输出以下JSON结构：
{
  "sceneDescription": "场景描述（1-2句，用于显示）",
  "narration": "${isEnding ? '结局叙述（约200字）' : '剧情叙述（150-250字，第二人称你，悬疑氛围）'}",
  "sceneImageKey": "场景图片key，只能从以下值中选择：entrance（小镇入口/警长相关）、tavern（酒馆/老板娘相关）、forest（森林/神秘老人相关）、lighthouse（灯塔/结局抉择）、ending（结局画面）、default（无法判断时）",
  "sceneImagePrompt": "用于AI生成场景图的英文提示词",
  "choices": [
    {"text": "选项1", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数},
    {"text": "选项2", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数},
    {"text": "选项3", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数}
  ],
  "isEnding": ${isEnding},
  "endingType": ${isEnding ? `"${determineEndingType(state)}"` : 'null'},
  "portrait": "当前出现的NPC名称（警长/酒馆老板娘/神秘老人）或null"
}

【文风要求】
1. 叙事必须具体、可理解：写清楚玩家看到了什么、听到了什么、可以做什么，避免堆砌抽象形容词和华丽修辞。
2. 少用"命运的低语""世界的真相""不可言说的存在"这类空泛表达，多用具体的场景、动作、对话和物品。
3. 保持悬疑和紧张感，但让玩家能看懂：发生了什么、涉及谁、线索是什么。
4. 每次剧情要推进一点：发现新信息、遇到新人物、进入新场景，或让矛盾升级。

【剧情规则】
1. 当前章节目标：${chapterInfo.goal}，可用场景：${chapterInfo.scenes.join('、')}
2. 嫌疑度越高，结局越差；线索越多，评级越高
3. 5种结局：good(嫌疑度<30)/bad(嫌疑度>70)/neutral(30-70)/hidden(获得古老符文)/special(获得共生契约)
4. choices 在 isEnding 为 true 时必须为空数组

【当前游戏状态】
${JSON.stringify({
  currentChapter: state.currentChapter,
  currentNode: state.currentNode,
  clues: state.clues,
  suspicion: state.suspicion,
  npcRelations: state.npcRelations,
  recentChoices: state.choices.slice(-5)
})}`;
}

function buildMessages(state, playerChoice, isEnding) {
  const messages = [{ role: 'system', content: buildSystemPrompt(state, isEnding) }];

  if (state.summaries.length) {
    messages.push({
      role: 'user',
      content: `【早期剧情摘要】\n${state.summaries.join('\n')}`
    });
  }

  const recent = state.storyHistory.slice(-3);
  recent.forEach((node, i) => {
    messages.push({
      role: 'assistant',
      content: JSON.stringify(node)
    });
    if (i === recent.length - 1 && playerChoice) {
      messages.push({
        role: 'user',
        content: `玩家选择了：${playerChoice}`
      });
    }
  });

  if (recent.length === 0) {
    messages.push({
      role: 'user',
      content: playerChoice
        ? `游戏开始。玩家选择了：${playerChoice}`
        : '游戏开始。请生成第一章第一段剧情。'
    });
  }

  return messages;
}

async function callAI(messages) {
  const config = getAIConfig();
  if (!config.apiKey) {
    throw new Error('NO_API_KEY');
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.8,
      max_tokens: 900,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API 错误 (${response.status}): ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('API 返回内容为空');

  return JSON.parse(content);
}

async function generateStoryNode(state, playerChoice = null) {
  const isEnding = state.currentChapter >= 5 && state.currentNode >= 9;
  const messages = buildMessages(state, playerChoice, isEnding);
  return callAI(messages);
}

async function testApiConnection({ apiKey, apiBaseUrl, model }) {
  const baseUrl = (apiBaseUrl || 'https://api.openai.com/v1').replace(/\/$/, '');
  if (!apiKey) {
    throw new Error('请先填写 API Key');
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'hi' }],
      max_tokens: 5
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('API 返回结构异常，未找到回复内容');
  }

  return {
    ok: true,
    model: data.model || model,
    content: data.choices[0].message.content.trim()
  };
}

async function generateEndingNarration(state) {
  const endingType = determineEndingType(state);
  const meta = getEndingMeta(endingType);

  const messages = [
    {
      role: 'system',
      content: `你是悬疑游戏编剧。根据游戏状态生成约200字的结局叙述，第二人称"你"，JSON格式输出：
{"narration": "...", "sceneDescription": "..."}

结局类型：${endingType}（${meta.title}）

要求：
1. 叙述必须具体、清晰，说清楚玩家最终做了什么决定、发现了什么、结局如何。
2. 不要使用"命运的低语""不可言说的真相""世界崩塌"这类空泛表达。
3. 如果涉及超自然元素，请写出具体的物品、动作或场景，而不是抽象概念。`
    },
    {
      role: 'user',
      content: JSON.stringify({
        clues: state.clues,
        suspicion: state.suspicion,
        choices: state.choices,
        npcRelations: state.npcRelations
      })
    }
  ];

  try {
    return { ...(await callAI(messages)), endingType };
  } catch {
    return null;
  }
}
