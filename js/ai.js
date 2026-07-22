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

  const STORY_BIBLE = `【故事圣经 — 必须严格遵守，这是游戏世界的绝对法则】

■ 核心真相（谜底 — AI必须牢记但绝不能一次性揭露）
迷雾小镇的失踪案不是超自然事件，是一场被两代人共同掩盖的"人祸"。
- 迷雾的本质：地下天然气泄漏 + 特殊矿物粉尘形成的致幻雾气，不是诅咒或怪物
- 灯塔封印：灯塔下方是旧矿井遗址，二十年前发生过矿难，官方记录被销毁。"封印"是掩盖矿难遗址的政治工具
- 失踪者陈远：地质调查员，发现灯塔下矿井与二十年前旧案的关联，掌握了现任警长周正父亲当年渎职封口的证据
- 陈远被周正威胁后藏匿，过程中意外坠入矿井生死不明。周正伪造失踪案，借迷雾诅咒恐吓镇民
- 真正的凶手不是某个具体的人，而是"集体的沉默"

■ 人物档案
1. 周正（警长）
   - 45岁，严肃、疲惫、对外来者格外警惕
   - 动机：阻止外人查清真相，因为真相会牵扯出父亲当年的罪行；内心对陈远有愧疚，但更害怕身败名裂
   - 秘密：他的父亲是二十年前矿难的负责人，把事故定性为"自然灾害"，参与封口
   - 行为模式：初期阻挠玩家（威胁、搜查、驱逐），不会杀人；如果关系够好，后期可能选择坦白或帮忙

2. 林婉（酒馆老板娘）
   - 38岁，温柔、谨慎、手腕上有淤青
   - 动机：保护女儿和陈远的遗物；既希望找到陈远，又害怕真相曝光后女儿被带走
   - 秘密：陈远的旧情人，女儿陈雨（7岁）是他们的孩子，藏在酒馆阁楼；周正知道她的事但一直没揭穿，两人之间有过默契
   - 行为模式：说话留半句，需要玩家取得信任才透露信息；关系好时主动提供码头仓库钥匙和陈远笔记本

3. 陆离（神秘老人）
   - 70岁，瘦削、眼神浑浊、常坐森林边缘
   - 动机：不想让更多人重蹈覆辙；对封印有执念，认为应维持现状
   - 秘密：二十年前矿难幸存者；知道灯塔下封印真相和迷雾矿石利用方法；手里有刻有符文的石片（当年矿井标识牌）
   - 行为模式：说话神神叨叨喜欢用隐喻；不会主动害人，但玩家强行破坏封印会出手阻止；尊重理解他时透露关键信息

4. 陈远（失踪者）
   - 30岁地质调查员，理想主义、执着、不善交际
   - 他在小镇做了什么：采集土壤矿物样本发现异常重金属→查到二十年前矿难记录被篡改→试图联系上级部门被周正截下→最后失踪，推测坠入灯塔下老矿井

5. 陈雨（小女孩，可能出场）
   - 7岁，陈远和林婉的女儿
   - 作用：提供童真证词如"爸爸去了塔下面的门"；是林婉的软肋，也是推动玩家选择"保护"路线的情感锚点

■ 关键地点
- 小镇入口：玩家与小镇的边界，警长第一次出现
- 酒馆：人间烟火与秘密交汇，林婉、陈雨、陈远遗物
- 失踪者家：被掩盖的现场，日记残页、撬痕
- 森林/遗迹：传说的源头，符文石片、迷雾矿石
- 码头仓库：陈远的私人据点，航海日志、灯塔草图
- 老矿井通道：真相入口，二十年前旧案剪报、矿难遗址
- 灯塔：最终抉择的舞台，封印、周正的枪口、陆离的石片

■ 每章必发生事件
- 第1章：玩家到达→见到警长周正→进入酒馆见林婉→发现阁楼小女孩→获得至少2条线索
- 第2章：调查失踪者家→森林边缘见陆离→获得关于陈远调查的线索→获得至少2条线索
- 第3章：周正开始阻挠（搜查玩家房间）→林婉和陆离分别向玩家靠拢→获得码头仓库线索
- 第4章：码头仓库→老矿井通道→灯塔下方三方对峙→灯塔顶层最终抉择
- 第5章：根据累积状态生成结局

■ 禁止事项（绝对不可违反）
1. 禁止引入新的超自然元素（鬼魂、怪物、诅咒实体）——迷雾是天然气+矿物粉尘，不是超自然
2. 禁止让NPC性格突变（如周正突然变冷血杀手、林婉突然变成反派）
3. 禁止让陈远"复活"给出明确证词——保持开放式
4. 禁止使用空泛修辞（"命运的低语""不可言说的存在""世界的真相"）
5. 禁止脱离故事核心：这是一起人祸，不是奇幻冒险
6. 禁止一段叙述中同时发生超过2个事件（一段一推进）

■ 叙事原则
1. 每段叙述只推进一件事：新线索、新地点、新人物关系或新冲突
2. 叙述要具体：写出玩家看到、听到、触摸到的东西，用动作和对话代替形容词
3. 选项要有明确的风险与收益差异，让玩家能基于已知信息做判断
4. 保持悬疑氛围但让玩家看懂：发生了什么、涉及谁、线索是什么`;

  const CHAPTER_OUTLINE = chapterNum === 1
    ? `第1章「雾中初至」大纲：
  节点1：玩家抵达小镇入口，遇见警长周正（冷淡、警惕、警告玩家不要多管闲事）
  节点2：小镇街道，看到寻人启事和紧张气氛
  节点3：酒馆遇见林婉，发现她手腕淤青和墙上旧照片
  节点4：酒馆阁楼，听见小女孩哼歌，发现林婉藏着孩子
  本章核心：小镇不欢迎外来者；林婉有秘密；失踪案另有隐情。`
    : chapterNum === 2
    ? `第2章「暗影浮现」大纲：
  节点5：失踪者家，门窗被封，后院有撬痕
  节点6：失踪者屋内，日记残页写着"迷雾不是自然的"
  节点7：森林边缘遇见陆离，得知"迷雾有意志"
  节点8：森林深处遗迹，刻有符文的石板和凹槽
  本章核心：陈远在调查某种异常；森林里有人知道内情。`
    : chapterNum === 3
    ? `第3章「危机四伏」大纲：
  节点9：陆离透露"失踪的人碰了不该碰的东西"，交给玩家符文石片
  节点10：周正搜查玩家房间，质问发现了什么
  节点11：林婉坦白陈远是她最重要的人，女儿是他的孩子，交给码头仓库钥匙
  节点12：小镇广场，镇民开始监视玩家
  本章核心：玩家已被盯上；林婉与案件直接相关；陈远女儿是关键证人。`
    : chapterNum === 4
    ? `第4章「真相边缘」大纲：
  节点13：码头仓库，找到陈远航海日志和灯塔草图
  节点14：老矿井通道，发现二十年前旧案剪报，现任警长父亲涉案
  节点15：灯塔下方，周正、陆离、林婉三方对峙
  节点16：灯塔顶层，决定如何处理封印与真相
  本章核心：真相是人祸而非诅咒；警长父亲渎职；陈远可能还活着（存疑）。`
    : `第5章：结局。根据累积状态决定结局类型。`;

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
3. 6种结局：good(嫌疑度<30)/bad(嫌疑度>70)/neutral(嫌疑度30-70)/hidden(获得古老符文并深入调查封印)/special(获得共生契约并与陆离合作维持封印)/friendship(任一NPC好感度≥80且嫌疑度<60)
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
