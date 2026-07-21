/** 剧情框架与内置演示剧情 — 全局变量版 */

const storyFramework = {
  chapter1: {
    goal: '认识小镇，获得初步线索',
    scenes: ['小镇入口', '警局', '酒馆']
  },
  chapter2: {
    goal: '收集线索，嫌疑人浮出水面',
    scenes: ['失踪者家', '森林边缘', '教堂']
  },
  chapter3: {
    goal: '嫌疑人反击，玩家陷入危险',
    scenes: ['地下密室', '悬崖边', '码头']
  },
  chapter4: {
    goal: '发现真相，做出关键抉择',
    scenes: ['灯塔', '老矿井', '小镇广场']
  },
  chapter5: {
    goal: '根据累积选择决定结局',
    scenes: ['迷雾散去的小镇']
  }
};

const ENDING_META = {
  good: { title: '真相大白', label: '好结局 — 正义得以伸张' },
  bad: { title: '沉冤海底', label: '坏结局 — 迷雾吞噬了真相' },
  neutral: { title: '迷雾永驻', label: '中性结局 — 真相悬而未决' },
  hidden: { title: '深渊之眼', label: '隐藏结局 — 你窥见了不该知晓的秘密' },
  special: { title: '共生迷雾', label: '特殊结局 — 你与小镇达成了某种默契' }
};

const SPECIAL_CLUES = ['古老符文', '迷雾核心', '共生契约'];
const SPECIAL_CHOICE_PATTERN = ['信任神秘老人', '接受迷雾'];

const SCENE_IMAGES = {
  default: 'assets/images/scene-default.png',
  entrance: 'assets/images/scene-entrance.png',
  tavern: 'assets/images/scene-tavern.png',
  forest: 'assets/images/scene-forest.png',
  lighthouse: 'assets/images/scene-lighthouse.png',
  ending: 'assets/images/scene-ending.png'
};

const PORTRAITS = {
  警长: 'assets/portraits/sheriff.png',
  酒馆老板娘: 'assets/portraits/innkeeper.png',
  神秘老人: 'assets/portraits/elder.png'
};

const DEMO_NODES = [
  {
    sceneDescription: '小镇入口 — 浓雾如墙，警长在雾中等你。',
    narration:
      '你抵达迷雾小镇的入口。浓雾几乎吞没了道路两侧的房屋轮廓，只有远处钟楼模糊的剪影。一名警长从雾中走出，皮靴踩在湿石板上的声音格外清晰。他打量着你，眼神里既有警惕，也有一丝难以掩饰的疲惫。"又一个外来者，"他低声说，"失踪案发生后，这里已经不太欢迎陌生人了。"',
    sceneImageKey: 'entrance',
    portrait: '警长',
    choices: [
      { text: '出示侦探证件，表明来意', suspicionDelta: 0, clue: null, npc: '警长', relationDelta: 5 },
      { text: '装作路过的游客，先观察情况', suspicionDelta: 10, clue: null, npc: null, relationDelta: 0 },
      { text: '直接询问失踪案的细节', suspicionDelta: -5, clue: '警长很紧张', npc: '警长', relationDelta: -3 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '酒馆 — 烛火摇曳，老板娘欲言又止。',
    narration:
      '你推开酒馆的门，一股混合着木屑与陈年麦酒的气息扑面而来。酒馆里几乎空无一人，只有老板娘在吧台后擦拭杯子。她看见你，动作微微一顿。"警长让你来的？"她问，声音压得很低。你注意到她手腕上有一道新鲜的淤青，而她迅速用袖子遮住了它。墙上挂着一张泛黄的照片，失踪者的笑脸在烛光下显得格外刺眼。',
    sceneImageKey: 'tavern',
    portrait: '酒馆老板娘',
    choices: [
      { text: '询问她手腕上的伤', suspicionDelta: 5, clue: '老板娘的淤青', npc: '酒馆老板娘', relationDelta: -8 },
      { text: '点一杯酒，慢慢套话', suspicionDelta: -3, clue: '失踪者常来酒馆', npc: '酒馆老板娘', relationDelta: 8 },
      { text: '查看墙上的照片', suspicionDelta: 0, clue: '照片背面的日期', npc: null, relationDelta: 0 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '森林边缘 — 迷雾深处传来低语。',
    narration:
      '你沿着失踪者最后出现的路线来到森林边缘。树木在雾中扭曲成怪异的形状，仿佛有什么东西在注视着你。一位神秘老人坐在倒下的树干上，他的眼睛在暗处泛着奇异的光。"你闻到了吗？"他喃喃道，"迷雾有它自己的意志。那个消失的人……不是第一个，也不会是最后一个。"他从怀中掏出一枚刻满符文的石片，"想要真相，就要付出代价。"',
    sceneImageKey: 'forest',
    portrait: '神秘老人',
    choices: [
      { text: '接过石片，询问符文的含义', suspicionDelta: 0, clue: '古老符文', npc: '神秘老人', relationDelta: 10 },
      { text: '无视老人，独自深入森林', suspicionDelta: 15, clue: '森林中的脚印', npc: '神秘老人', relationDelta: -10 },
      { text: '记录老人的话，但不接受石片', suspicionDelta: -5, clue: '迷雾有意志', npc: '神秘老人', relationDelta: 3 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '灯塔 — 真相在风暴来临前浮出水面。',
    narration:
      '你爬上灯塔，狂风裹挟着浓雾拍打着窗户。所有线索在脑海中拼凑成一幅完整的图景：失踪者发现了小镇的秘密，而迷雾并非自然现象。警长、老板娘、神秘老人——每个人都藏着一部分真相。现在，你必须做出最后的抉择。下方的广场上传来镇民的呼喊，迷雾正在以肉眼可见的速度收缩，将整个小镇包裹其中。',
    sceneImageKey: 'lighthouse',
    portrait: null,
    choices: [
      { text: '公开真相，召集镇民对抗迷雾', suspicionDelta: -10, clue: '灯塔日志', npc: null, relationDelta: 0 },
      { text: '与警长合作，秘密处理此事', suspicionDelta: 0, clue: null, npc: '警长', relationDelta: 5 },
      { text: '接受神秘老人的提议，与迷雾共生', suspicionDelta: 5, clue: '共生契约', npc: '神秘老人', relationDelta: 15 }
    ],
    isEnding: false
  }
];

const DEMO_ENDINGS = {
  good: {
    sceneDescription: '迷雾散去 — 阳光重新照耀小镇。',
    narration:
      '你选择了公开真相。在你的证据面前，镇民们终于鼓起勇气面对被掩盖的历史。迷雾在黎明时分缓缓散去，失踪者的遗体在灯塔下被发现，凶手落网。警长向你敬礼，老板娘含泪道谢。小镇恢复了往日的宁静，虽然伤痕仍在，但正义终究到来。你收拾好行囊，知道这段经历将成为你侦探生涯中难以磨灭的一页。'
  },
  bad: {
    sceneDescription: '迷雾永封 — 再无人记得你的到来。',
    narration:
      '你的鲁莽让嫌疑度飙升，镇民们将你视为威胁。迷雾在某一夜彻底吞噬了小镇，所有的线索、所有的真相都随着浓雾消散。当你醒来时，发现自己躺在小镇入口外的公路上，口袋里只剩下一张空白的名片。你不记得迷雾小镇，不记得失踪案，不记得你自己曾经是谁。只有远处隐约的钟声，似乎在诉说着什么。'
  },
  neutral: {
    sceneDescription: '迷雾永驻 — 真相悬而未决。',
    narration:
      '你收集了足够的线索，却未能在最后时刻做出决断。迷雾既不散去，也未加深，小镇维持着一种诡异的平衡。失踪者的下落依然成谜，而你——作为唯一的外来者——被允许留在镇上，但永远不被接纳。每天清晨，你都会在浓雾中醒来，隐约觉得有什么重要的事情被遗忘了。'
  },
  hidden: {
    sceneDescription: '深渊之眼 — 你看见了不该看的东西。',
    narration:
      '古老符文在你手中发出微光，迷雾的核心在你面前展开。你窥见了小镇真正的历史：这里曾是某种古老存在的封印之地，而失踪者正是因为触碰了封印。你获得了超越人类理解的知识，但也付出了代价——你的影子在雾中有了自己的意志。你成为了小镇的守护者，也是新的囚徒。'
  },
  special: {
    sceneDescription: '共生迷雾 — 你成为了雾的一部分。',
    narration:
      '你接受了神秘老人的提议。迷雾温柔地包裹了你，不再冰冷，反而像一层温暖的薄纱。你理解了失踪者为何消失——他不是死亡，而是转化。你成为了迷雾与人间之间的桥梁，小镇在你的守护下维持着微妙的和平。偶尔有旅人路过，他们会看到一个在雾中微笑的侦探，然后安全地离开，永远不知道自己在鬼门关前走了一遭。'
  }
};

function getChapterInfo(chapter) {
  const key = `chapter${chapter}`;
  return storyFramework[key] || storyFramework.chapter5;
}

function resolveSceneImage(node) {
  // 优先使用 AI 返回的 sceneImageKey
  if (node.sceneImageKey && SCENE_IMAGES[node.sceneImageKey]) {
    return SCENE_IMAGES[node.sceneImageKey];
  }

  // 智能兜底：根据场景描述和剧情叙述自动匹配场景图
  const text = `${node.sceneDescription || ''} ${node.narration || ''}`.toLowerCase();

  if (
    text.includes('酒馆') ||
    text.includes('吧台') ||
    text.includes('酒杯') ||
    text.includes('老板娘') ||
    text.includes('麦酒') ||
    text.includes('烛光')
  ) {
    return SCENE_IMAGES.tavern;
  }

  if (
    text.includes('森林') ||
    text.includes('树') ||
    text.includes('树干') ||
    text.includes('神秘老人') ||
    text.includes('符文')
  ) {
    return SCENE_IMAGES.forest;
  }

  if (
    text.includes('灯塔') ||
    text.includes('塔顶') ||
    text.includes('风暴') ||
    text.includes('真相浮出水面')
  ) {
    return SCENE_IMAGES.lighthouse;
  }

  if (
    text.includes('入口') ||
    text.includes('小镇入口') ||
    text.includes('雾中') ||
    text.includes('警长') && text.includes('入口')
  ) {
    return SCENE_IMAGES.entrance;
  }

  return SCENE_IMAGES.default;
}
