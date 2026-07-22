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
  const chapterNum = state.currentChapter;

  const STORY_BIBLE = `【故事圣经 — 必须严格遵守】

■ 人物档案
1. 警长 赵铁柱
   - 动机：维护小镇秩序，但暗中掩盖与失踪者的旧怨
   - 秘密：失踪者曾发现警长的一桩旧事，警长有灭口动机但没有动手
   - 行为模式：表面冷淡配合，回避关键问题，但不会主动伤害玩家

2. 酒馆老板娘 林婉
   - 动机：保护失踪者的女儿（藏在酒馆阁楼）
   - 秘密：失踪者是她的情人，女儿是他们的孩子
   - 行为模式：试探玩家的立场，对信任的人透露信息，对不信任的人沉默

3. 神秘老人（真名：守墓人）
   - 动机：守护封印在森林深处的古老遗迹
   - 秘密：迷雾是遗迹的防护层，失踪者误入遗迹触发了异常
   - 行为模式：用谜语和隐喻说话，只对持有特定线索的人透露真相

■ 每章必发生事件
- 第1章：玩家到达→见到警长→进入酒馆→获得至少1条线索
- 第2章：调查失踪者家→在森林边缘见到神秘老人→获得至少2条线索→嫌疑度发生显著变化
- 第3章：发现地下密室→遭到未知力量威胁→与一名NPC关系达到关键点
- 第4章：登上灯塔→拼凑真相→面临最终抉择
- 第5章：结局

■ 禁止事项
1. 禁止凭空引入新超自然元素（只能使用：迷雾、古老符文、共生契约这三个设定）
2. 禁止让已知NPC性格突变（如警长突然变得友善或暴力）
3. 禁止让玩家在未获得线索的情况下直接得知真相
4. 禁止在叙述中出现"命运""世界的真相""不可言说的存在""虚空的低语"等空泛词汇
5. 禁止在一段叙述中同时发生超过2个事件（一段一推进）`;

  const CHAPTER_OUTLINE = chapterNum === 1
    ? `第1章大纲：玩家刚到小镇入口→警长出现并盘问→玩家进入酒馆遇见老板娘→获得第一条线索。
   当前位置在上述流程中的某一步，请根据currentNode判断。`
    : chapterNum === 2
    ? `第2章大纲：玩家调查失踪者的家→在森林边缘遇到神秘老人→获得关键线索（古老符文或迷雾有意志）。
   当前位置在上述流程中的某一步。`
    : chapterNum === 3
    ? `第3章大纲：玩家发现地下密室→遭到威胁→必须与某NPC合作才能脱险。`
    : chapterNum === 4
    ? `第4章大纲：玩家登上灯塔→所有线索拼合→面临最终抉择。`
    : `第5章：结局。`;

  return `你是一个悬疑文字冒险游戏的剧情生成AI。

${STORY_BIBLE}

【你的任务】
根据当前游戏状态和玩家的选择，生成${isEnding ? '最终结局' : '下一段剧情'}，以JSON格式输出。

【${CHAPTER_OUTLINE}】

【输出格式要求】
必须输出以下JSON结构：
{
  "sceneDescription": "场景描述（1句话，10-20字）",
  "narration": "${isEnding ? '结局叙述（约200字）' : '剧情叙述（80-120字，第二人称你）'}",
  "sceneImageKey": "场景图片key，只能从以下值中选择：entrance（小镇入口/警长相关）、tavern（酒馆/老板娘相关）、forest（森林/神秘老人相关）、lighthouse（灯塔/结局抉择）、ending（结局画面）、default（无法判断时）",
  "choices": [
    {"text": "选项1（15-30字）", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数},
    {"text": "选项2（15-30字）", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数},
    {"text": "选项3（15-30字）", "suspicionDelta": -10到+10的整数, "clue": "线索名称或null", "npc": "NPC名称或null", "relationDelta": -10到+10的整数}
  ],
  "isEnding": ${isEnding},
  "endingType": ${isEnding ? `"${determineEndingType(state)}"` : 'null'},
  "portrait": "当前出现的NPC名称（警长/酒馆老板娘/神秘老人）或null"
}

【文风要求 — 一段一推进】
1. 每段叙述只推进一件事：要么发现新信息，要么遇到新人物，要么进入新场景，要么矛盾升级。不要一段塞多件事。
2. 叙述必须具体：写清楚玩家看到了什么、听到了什么、谁说了什么话。用动作和对话代替形容词。
3. 保持悬疑感但让玩家看懂：发生了什么、涉及谁、线索是什么。
4. narration字数严格限制在80-120字（结局除外）。超过120字会破坏游戏节奏。

【剧情规则】
1. 当前章节目标：${chapterInfo.goal}，可用场景：${chapterInfo.scenes.join('、')}
2. 嫌疑度越高，结局越差；线索越多，评级越高
3. 5种结局：good(嫌疑度<30)/bad(嫌疑度>70)/neutral(30-70)/hidden(获得古老符文)/special(获得共生契约)
4. choices 在 isEnding 为 true 时必须为空数组
5. 选项必须有策略感：不同选项应有明确的风险/收益差异，让玩家能判断

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
      temperature: 0.6,
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
