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
  // ===== 第1章：到达小镇 =====
  {
    sceneDescription: '小镇入口 — 浓雾如墙',
    narration: '你抵达迷雾小镇的入口。浓雾吞没了道路两侧的房屋，只有远处钟楼模糊的剪影。一名警长从雾中走出，皮靴踩在湿石板上格外清晰。"又一个外来者，"他低声说，"失踪案发生后，这里不太欢迎陌生人了。"',
    sceneImageKey: 'entrance',
    portrait: '警长',
    choices: [
      { text: '出示侦探证件，表明来意', suspicionDelta: 0, clue: null, npc: '警长', relationDelta: 5 },
      { text: '装作路过的游客，先观察', suspicionDelta: 10, clue: null, npc: null, relationDelta: 0 },
      { text: '直接询问失踪案细节', suspicionDelta: -5, clue: '警长很紧张', npc: '警长', relationDelta: -3 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '小镇街道 — 雾中行走',
    narration: '警长没有阻拦你，只是说了一句"别待太久"便转身消失在雾中。你沿着石板路往前走，两侧的房屋窗户紧闭，门上挂着褪色的符纸。你注意到路口的公告栏上贴着一张寻人启事——照片上的人你见过，是失踪者。',
    sceneImageKey: 'entrance',
    portrait: null,
    choices: [
      { text: '撕下寻人启事仔细研究', suspicionDelta: 0, clue: '寻人启事', npc: null, relationDelta: 0 },
      { text: '继续往前走，不浪费时间', suspicionDelta: 5, clue: null, npc: null, relationDelta: 0 },
      { text: '敲旁边住户的门询问', suspicionDelta: 15, clue: null, npc: null, relationDelta: 0 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '酒馆 — 烛火摇曳',
    narration: '你推开酒馆的门。酒馆里几乎空无一人，只有老板娘在吧台后擦杯子。她看见你，动作微微一顿。"警长让你来的？"她压低声音问。你注意到她手腕上有一道新鲜的淤青，她迅速用袖子遮住了。墙上挂着一张泛黄的照片。',
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
    sceneDescription: '酒馆阁楼 — 隐秘的房间',
    narration: '你借口去洗手间，偷偷上了二楼。楼梯尽头有一扇上锁的门，门缝透出微弱的灯光。你趴在门上听，里面传来小女孩哼歌的声音——是一首你从未听过的摇篮曲。老板娘的脚步声从楼下传来，她似乎发现了你上楼。',
    sceneImageKey: 'tavern',
    portrait: '酒馆老板娘',
    choices: [
      { text: '快速记录后假装没看到', suspicionDelta: -3, clue: '阁楼上的孩子', npc: '酒馆老板娘', relationDelta: 3 },
      { text: '直接敲门询问小女孩身份', suspicionDelta: 20, clue: '阁楼上的孩子', npc: '酒馆老板娘', relationDelta: -15 },
      { text: '悄悄退回楼下，不惊动她', suspicionDelta: 0, clue: null, npc: '酒馆老板娘', relationDelta: 0 }
    ],
    isEnding: false
  },

  // ===== 第2章：深入调查 =====
  {
    sceneDescription: '失踪者的家 — 门窗封死',
    narration: '第二天清晨，你找到失踪者的住所。门窗被木板封死，邻居说警长亲自来钉的，说"防止外人进去破坏现场"。你绕到后院，发现一扇窗户的木板有被撬过的痕迹，木屑还是新的。',
    sceneImageKey: 'entrance',
    portrait: null,
    choices: [
      { text: '撬开窗户翻进去查看', suspicionDelta: 5, clue: '失踪者的日记残页', npc: null, relationDelta: 0 },
      { text: '找邻居打听失踪者的情况', suspicionDelta: -5, clue: '失踪者是外来者', npc: null, relationDelta: 0 },
      { text: '先去找警长申请进入', suspicionDelta: -10, clue: null, npc: '警长', relationDelta: 5 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '失踪者屋内 — 凌乱的房间',
    narration: '你从窗户翻入屋内。房间里翻得乱七八糟，抽屉被拉出，书架倒了一半。地上散落着几张撕碎的纸——你拼起来一看，是日记残页，上面写着："迷雾不是自然的……它在保护什么东西……我必须找到入口。"',
    sceneImageKey: 'entrance',
    portrait: null,
    choices: [
      { text: '继续搜索房间找更多线索', suspicionDelta: 5, clue: '失踪者的日记残页', npc: null, relationDelta: 0 },
      { text: '带上残页迅速离开', suspicionDelta: 0, clue: null, npc: null, relationDelta: 0 },
      { text: '检查墙上是否有暗格或暗门', suspicionDelta: 0, clue: '墙上的刻痕', npc: null, relationDelta: 0 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '森林边缘 — 迷雾深处',
    narration: '你沿着失踪者最后出现的路线来到森林边缘。树木在雾中扭曲成怪异的形状。一位老人坐在倒下的树干上，眼睛在暗处泛着奇异的光。"你闻到了吗？"他喃喃道，"迷雾有它自己的意志。"',
    sceneImageKey: 'forest',
    portrait: '神秘老人',
    choices: [
      { text: '询问老人关于失踪者的事', suspicionDelta: 0, clue: '失踪者来过森林', npc: '神秘老人', relationDelta: 5 },
      { text: '问他"迷雾有意志"是什么意思', suspicionDelta: 0, clue: '迷雾有意志', npc: '神秘老人', relationDelta: 8 },
      { text: '不理会他，独自深入森林', suspicionDelta: 15, clue: '森林中的脚印', npc: '神秘老人', relationDelta: -10 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '森林深处 — 古老遗迹',
    narration: '老人没有阻拦你，只是叹了口气。你沿着脚印走了大约二十分钟，雾越来越浓。突然脚下踩到一块坚硬的石板——上面刻满了你看不懂的符文，呈螺旋状排列。石板中央有一个凹槽，像某种容器。空气中有一种低沉的嗡嗡声。',
    sceneImageKey: 'forest',
    portrait: '神秘老人',
    choices: [
      { text: '用手机拍下符文带走研究', suspicionDelta: 0, clue: '古老符文', npc: '神秘老人', relationDelta: 5 },
      { text: '把手伸进凹槽探索', suspicionDelta: 20, clue: '遗迹凹槽的反应', npc: '神秘老人', relationDelta: -5 },
      { text: '原路返回，去找老人问清楚', suspicionDelta: -5, clue: null, npc: '神秘老人', relationDelta: 10 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '森林边缘 — 老人的低语',
    narration: '你回到老人身边。他看着你，似乎早就知道你会回来。"那块石板是封印，"他说，"迷雾是封印的副产品。失踪的人……他碰了不该碰的东西。"他从怀中掏出一枚刻满符文的石片递给你，"想要真相，就要付出代价。"',
    sceneImageKey: 'forest',
    portrait: '神秘老人',
    choices: [
      { text: '接过石片，询问符文含义', suspicionDelta: 0, clue: '古老符文', npc: '神秘老人', relationDelta: 10 },
      { text: '拒绝石片，要求他直接说', suspicionDelta: 10, clue: null, npc: '神秘老人', relationDelta: -5 },
      { text: '记录他的话但不接受石片', suspicionDelta: -5, clue: '迷雾有意志', npc: '神秘老人', relationDelta: 3 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '返回小镇 — 警长的警告',
    narration: '你从森林返回小镇路上，遇到了警长。他脸色阴沉，挡住了你的路。"我警告过你别乱走，"他说，"森林很危险，已经有人因此失踪了。"他盯着你的口袋——你藏了残页和石片。"你在森林里找到什么了？"',
    sceneImageKey: 'entrance',
    portrait: '警长',
    choices: [
      { text: '如实告诉他石片和残页的事', suspicionDelta: -10, clue: null, npc: '警长', relationDelta: 8 },
      { text: '谎称什么都没找到', suspicionDelta: 15, clue: null, npc: '警长', relationDelta: -10 },
      { text: '反问他为什么封死失踪者的家', suspicionDelta: 5, clue: '警长封了失踪者的家', npc: '警长', relationDelta: -5 }
    ],
    isEnding: false
  },
  {
    sceneDescription: '酒馆夜谈 — 老板娘的秘密',
    narration: '夜深了，你回到酒馆。老板娘等你很久了，她锁上门，压低声音说："我知道你去了森林。我也知道你见了那个老人。"她的眼眶泛红，"失踪的人叫陈远，他是……我最重要的人。他的女儿在我这里，我不能让任何人知道。"',
    sceneImageKey: 'tavern',
    portrait: '酒馆老板娘',
    choices: [
      { text: '承诺保护她和孩子的安全', suspicionDelta: -10, clue: '失踪者叫陈远', npc: '酒馆老板娘', relationDelta: 15 },
      { text: '要求她交出陈远的所有遗物', suspicionDelta: 5, clue: '陈远的笔记本', npc: '酒馆老板娘', relationDelta: -5 },
      { text: '询问她和警长之间的关系', suspicionDelta: 0, clue: '警长与老板娘的矛盾', npc: '酒馆老板娘', relationDelta: 3 }
    ],
    isEnding: false
  },

  // ===== 第3章开头：危机浮现 =====
  {
    sceneDescription: '小镇广场 — 紧张的气氛',
    narration: '第三天清晨，小镇广场聚集了几个面色不善的镇民。他们看到你就停下交谈，用警惕的目光注视着。酒馆老板娘匆匆跑来，小声告诉你："警长昨夜带人去了你的房间搜过了。你的东西被翻过了。"她塞给你一把钥匙，"去码头仓库，那里有陈远留下的东西。"',
    sceneImageKey: 'entrance',
    portrait: '酒馆老板娘',
    choices: [
      { text: '立刻赶往码头仓库', suspicionDelta: 0, clue: null, npc: null, relationDelta: 0 },
      { text: '先去找警长当面对质', suspicionDelta: 10, clue: null, npc: '警长', relationDelta: -8 },
      { text: '假装不知情，暗中观察镇民', suspicionDelta: -5, clue: '镇民在监视你', npc: null, relationDelta: 0 }
    ],
    isEnding: false
  }
];

const DEMO_ENDINGS = {
  good: {
    sceneDescription: '迷雾散去 — 阳光重新照耀小镇',
    narration: '你公开了所有证据。在你的证据面前，镇民们终于鼓起勇气面对真相。警长交代了他与陈远的旧怨，承认自己故意封锁消息。老板娘带着女儿从阁楼走出来，含泪道谢。迷雾在黎明时分缓缓散去，陈远的遗体在灯塔下被发现。凶手落网，小镇恢复了往日的宁静。你收拾好行囊，知道这段经历将成为你侦探生涯中难以磨灭的一页。'
  },
  bad: {
    sceneDescription: '迷雾永封 — 再无人记得你的到来',
    narration: '你的鲁莽让嫌疑度飙升，镇民们将你视为威胁。警长带人搜查了你的住处，发现了你收集的线索和石片。你被驱逐出小镇，所有证据被销毁。当你回到公路上时，口袋里只剩一张空白的名片。你不记得迷雾小镇，不记得失踪案，不记得自己曾经是谁。只有远处隐约的钟声，似乎在诉说着什么。'
  },
  neutral: {
    sceneDescription: '迷雾永驻 — 真相悬而未决',
    narration: '你收集了足够的线索，却未能在最后时刻做出决断。迷雾既不散去，也未加深，小镇维持着诡异的平衡。陈远的下落依然成谜，而你——作为唯一的外来者——被允许留在镇上，但永远不被接纳。每天清晨你都在浓雾中醒来，隐约觉得有什么重要的事情被遗忘了。'
  },
  hidden: {
    sceneDescription: '深渊之眼 — 你看见了不该看的东西',
    narration: '古老符文在你手中发出微光。你在森林遗迹的凹槽中放入石片，封印裂开了一条缝隙。你看见了小镇真正的历史：这里曾是某种古老存在的封印之地，陈远正是因为触碰了封印而消失。你获得了超越常人的知识，但影子在雾中开始有了自己的意志。你成为了小镇的守护者，也是新的囚徒。'
  },
  special: {
    sceneDescription: '共生迷雾 — 你成为了雾的一部分',
    narration: '你接受了神秘老人的提议。迷雾温柔地包裹了你，不再冰冷，反而像一层温暖的薄纱。你理解了陈远为何消失——他不是死亡，而是转化。你成为了迷雾与人间之间的桥梁，小镇在你的守护下维持着微妙的和平。偶尔有旅人路过，他们会看到一个在雾中微笑的侦探，然后安全地离开。'
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
