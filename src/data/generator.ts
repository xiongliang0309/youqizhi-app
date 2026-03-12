import { faker } from '@faker-js/faker';
import { CLASSIC_STORIES } from './storyData';
import BEILEHU_SONGS from './beilehu_songs.json'; // 引入下载的儿歌元数据

// --- 基础类型定义 ---
export type WordCategory = 'fruit' | 'animal' | 'color' | 'vehicle' | 'nature' | 'action';

export interface WordCard {
  id: string;
  word: string;
  translation: string;
  image: string;
  category: WordCategory;
}

export type LogicCategory = 'pattern' | 'count' | 'math' | 'compare';

export interface LogicGameLevel {
  id: string;
  question: string;
  options: string[];
  answer: string;
  type: LogicCategory;
}

// --- 扩展类型定义 ---

export type ScienceCategory = 'knowledge' | 'job' | 'space' | 'animal_fact';

export interface ScienceCard {
  id: string;
  title: string;
  content: string;
  image: string;
  category: ScienceCategory;
  tags?: string[];
}

export type CultureCategory = 'poem' | 'song' | 'idiom';

export interface CultureCard {
  id: string;
  title: string;
  author?: string;
  content: string[];
  image: string;
  category: CultureCategory;
  audio?: string;
  cover?: string; // 新增封面字段
}

export interface StoryCard {
  id: string;
  title: string;
  cover: string;
  summary: string;
  pages: string[];
  tags?: string[];
}

// --- 1. 实体属性库 (Entity Database) - 用于生成符合逻辑的事实 ---
const ENTITIES = {
  animals: [
    { name: '大象', en: 'Elephant', size: 5, speed: 2, habitat: 'land', diet: 'herbivore', sound: 'Paawoo', emoji: '🐘' },
    { name: '蚂蚁', en: 'Ant', size: 0.1, speed: 1, habitat: 'land', diet: 'omnivore', sound: '...', emoji: '🐜' },
    { name: '猎豹', en: 'Cheetah', size: 3, speed: 5, habitat: 'land', diet: 'carnivore', sound: 'Roar', emoji: '🐆' },
    { name: '乌龟', en: 'Turtle', size: 1, speed: 0.5, habitat: 'land/water', diet: 'herbivore', sound: '...', emoji: '🐢' },
    { name: '老鹰', en: 'Eagle', size: 2, speed: 4, habitat: 'sky', diet: 'carnivore', sound: 'Screech', emoji: '🦅' },
    { name: '蓝鲸', en: 'Whale', size: 10, speed: 3, habitat: 'water', diet: 'carnivore', sound: 'Mooo', emoji: '🐋' },
    { name: '兔子', en: 'Rabbit', size: 1, speed: 3, habitat: 'land', diet: 'herbivore', sound: 'Squeak', emoji: '🐰' },
    { name: '狮子', en: 'Lion', size: 4, speed: 4, habitat: 'land', diet: 'carnivore', sound: 'Roar', emoji: '🦁' },
  ],
  vehicles: [
    { name: '自行车', en: 'Bike', speed: 1, wheels: 2, emoji: '🚲' },
    { name: '汽车', en: 'Car', speed: 3, wheels: 4, emoji: '🚗' },
    { name: '火车', en: 'Train', speed: 4, wheels: 100, emoji: '🚂' },
    { name: '飞机', en: 'Plane', speed: 5, wheels: 3, emoji: '✈️' },
    { name: '火箭', en: 'Rocket', speed: 10, wheels: 0, emoji: '🚀' },
  ],
  colors: [
    { name: '红色', en: 'Red', emoji: '🔴' },
    { name: '蓝色', en: 'Blue', emoji: '🔵' },
    { name: '绿色', en: 'Green', emoji: '🟢' },
    { name: '黄色', en: 'Yellow', emoji: '🟡' },
    { name: '紫色', en: 'Purple', emoji: '🟣' },
    { name: '黑色', en: 'Black', emoji: '⚫' },
    { name: '白色', en: 'White', emoji: '⚪' },
  ]
};

const ADJECTIVES = [
  { cn: '大大的', en: 'Big' },
  { cn: '小小的', en: 'Small' },
  { cn: '快乐的', en: 'Happy' },
  { cn: '伤心的', en: 'Sad' },
  { cn: '快速的', en: 'Fast' },
  { cn: '缓慢的', en: 'Slow' },
  { cn: '美丽的', en: 'Beautiful' },
];

// --- 预设基础数据 (保留) ---
const baseWords = { /* ... (保留原有结构，此处简化以节省篇幅，实际运行时会使用完整列表) ... */
  fruit: [
    { en: 'Apple', zh: '苹果', emoji: '🍎', level: 3 }, { en: 'Banana', zh: '香蕉', emoji: '🍌', level: 3 },
    { en: 'Grape', zh: '葡萄', emoji: '🍇', level: 3 }, { en: 'Orange', zh: '橘子', emoji: '🍊', level: 3 },
    { en: 'Watermelon', zh: '西瓜', emoji: '🍉', level: 4 }, { en: 'Lemon', zh: '柠檬', emoji: '🍋', level: 4 },
    { en: 'Peach', zh: '桃子', emoji: '🍑', level: 4 }, { en: 'Strawberry', zh: '草莓', emoji: '🍓', level: 4 }
  ],
  animal: ENTITIES.animals.map(a => ({ en: a.en, zh: a.name, emoji: a.emoji, level: 3 })), // 复用实体库
  color: ENTITIES.colors.map(c => ({ en: c.en, zh: c.name, emoji: c.emoji, level: 3 })),
  vehicle: ENTITIES.vehicles.map(v => ({ en: v.en, zh: v.name, emoji: v.emoji, level: 4 })),
  nature: [
    { en: 'Sun', zh: '太阳', emoji: '☀️', level: 5 }, { en: 'Moon', zh: '月亮', emoji: '🌙', level: 5 },
    { en: 'Star', zh: '星星', emoji: '⭐️', level: 5 }, { en: 'Flower', zh: '花朵', emoji: '🌸', level: 5 },
    { en: 'Tree', zh: '树木', emoji: '🌳', level: 5 }, { en: 'Rain', zh: '下雨', emoji: '🌧️', level: 5 }
  ],
  action: [
    { en: 'Run', zh: '跑', emoji: '🏃', level: 6 }, { en: 'Walk', zh: '走', emoji: '🚶', level: 6 },
    { en: 'Sleep', zh: '睡觉', emoji: '😴', level: 6 }, { en: 'Eat', zh: '吃', emoji: '🍽️', level: 6 },
    { en: 'Read', zh: '阅读', emoji: '📖', level: 6 }, { en: 'Write', zh: '写字', emoji: '✍️', level: 6 }
  ]
};

// --- 知识库 (保留原有高质量内容) ---
const SCIENCE_KNOWLEDGE_BASE = {
  knowledge: [
    { q: '为什么天空是蓝色的？', a: '太阳公公的光里有七种颜色，蓝色的小光线最调皮，跑到天上到处玩，所以天空就被染成蓝色啦。', icon: '🌤️' },
    { q: '为什么会有白天和黑夜？', a: '地球是个爱转圈的大陀螺，转到面对太阳的一面就是白天，背对太阳的一面就是黑夜。', icon: '🌍' },
    { q: '星星为什么会眨眼睛？', a: '星星的光穿过空气层时，空气流动让光一闪一闪的，就像在眨眼睛。', icon: '⭐' },
    { q: '月亮为什么会变形状？', a: '月亮绕着地球转，被太阳照亮的部分角度不同，所以有时圆圆，有时弯弯。', icon: '🌙' },
    { q: '彩虹是怎么出来的？', a: '下雨后空气里有小水滴，太阳光照进去，就像小镜子一样变出了七种颜色。', icon: '🌈' },
    { q: '为什么下雨前蚂蚁搬家？', a: '蚂蚁怕水淹没家，感觉到空气变湿，就要赶紧搬到高处。', icon: '🐜' },
    { q: '为什么树叶秋天变黄？', a: '天气变冷，叶绿素宝宝躲起来了，叶子原本的黄色就露出来啦。', icon: '🍂' },
    { q: '风是从哪里来的？', a: '空气受热往上跑，冷空气流过来填补，空气动起来就变成了风。', icon: '🌬️' },
    { q: '为什么有打雷闪电？', a: '云朵里的正负电碰到一起放电，发出的光是闪电，声音是打雷。', icon: '⚡' },
    { q: '雪花为什么是白色的？', a: '雪花是冰晶组成的，光照在上面反射回来，看起来就是白色的。', icon: '❄️' },
    { q: '海水为什么是咸的？', a: '雨水把陆地的盐冲进海里，水分蒸发了盐留下，所以海水是咸的。', icon: '🌊' },
    { q: '为什么花有各种颜色？', a: '花瓣里有花青素和胡萝卜素，像颜料一样染出了五颜六色的花。', icon: '🌸' },
    { q: '为什么向日葵向着太阳？', a: '向日葵喜欢光热，它脖子后的生长素怕光，会推着花盘转向太阳。', icon: '🌻' },
    { q: '为什么会有四季？', a: '地球斜着身子绕太阳转，不同时间离太阳距离和角度不同，就有了四季。', icon: '🍂' },
    { q: '为什么石头有花纹？', a: '石头经过几亿年的挤压和变化，泥沙或岩浆就变成了漂亮的花纹。', icon: '🪨' },
    { q: '为什么早晨有露珠？', a: '晚上的水蒸气碰到冷冷的草叶，就凝结成了晶莹的小水珠。', icon: '💧' },
    { q: '为什么会有地震？', a: '地面的大板块挤来挤去，动了一下，地就开始震动了。', icon: '🏚️' },
    { q: '为什么火山会喷发？', a: '地底岩浆压力太大，找个薄弱出口喷出来，就像摇晃后的可乐。', icon: '🌋' },
    { q: '为什么山顶有积雪？', a: '山顶很高很冷，雪落下来不会化，就变成了白白的长年积雪。', icon: '🏔️' },
    { q: '为什么会有雾？', a: '空气里的水蒸气遇冷变成无数小水滴，像给大地披上了白纱。', icon: '🌫️' },
    { q: '为什么兔子眼睛是红的？', a: '白兔眼睛透明，我们看到的是它眼球里的红色血管。', icon: '🐰' },
    { q: '长颈鹿脖子为什么长？', a: '为了吃到高处树上的嫩叶子，脖子就慢慢变长啦。', icon: '🦒' },
    { q: '大象鼻子为什么长？', a: '长鼻子像吸管和手，能喝水、拿东西，还能洗澡喷水。', icon: '🐘' },
    { q: '萤火虫为什么发光？', a: '它肚子里有发光器，是为了找朋友或吓跑敌人，像提个小灯笼。', icon: '💡' },
    { q: '变色龙为什么变色？', a: '为了保护自己躲避敌人，它会根据环境改变身体的颜色。', icon: '🦎' },
    { q: '啄木鸟为什么不头疼？', a: '它头骨坚硬，脑子里有减震海绵，能保护大脑不受伤。', icon: '🐦' },
    { q: '为什么袋鼠有袋子？', a: '袋鼠宝宝要在妈妈温暖的育儿袋里喝奶长大，像个随身摇篮。', icon: '🦘' },
    { q: '猫走路为什么没声音？', a: '猫咪脚下有厚厚的肉垫，像穿了软底鞋，走路静悄悄。', icon: '🐱' },
    { q: '鱼睡觉为什么睁眼？', a: '鱼没有眼睑，靠腮呼吸，睁着眼睛也能睡觉休息。', icon: '🐟' },
    { q: '斑马为什么有条纹？', a: '黑白条纹能扰乱敌人视线，还能防蚊虫，是它们的身份证。', icon: '🦓' },
    { q: '骆驼为什么有驼峰？', a: '驼峰里存的是脂肪，没吃的时能变能量，支撑它走远路。', icon: '🐫' },
    { q: '蜜蜂采蜜为什么要跳舞？', a: '跳舞是在告诉同伴花蜜在哪里，邀请大家一起去采蜜。', icon: '🐝' },
    { q: '蜘蛛网为什么不粘自己？', a: '蜘蛛腿上有油，而且它走路会避开那些粘粘的丝。', icon: '🕷️' },
    { q: '企鹅为什么不怕冷？', a: '企鹅有厚厚的脂肪和紧密的羽毛，像穿了保暖内衣和羽绒服。', icon: '🐧' },
    { q: '蛇为什么要吐舌头？', a: '蛇的舌头能闻味，吐舌头是在探测周围有没有猎物。', icon: '🐍' },
    { q: '公鸡早上为什么打鸣？', a: '公鸡对光线敏感，天亮就兴奋，也是在宣示自己的领地。', icon: '🐓' },
    { q: '鹦鹉为什么会说话？', a: '鹦鹉舌头灵活且爱模仿声音，经过训练就能学会说人话。', icon: '🦜' },
    { q: '大熊猫为什么吃竹子？', a: '以前熊猫也吃肉，后来环境变了，竹子多又常青，就改吃竹子了。', icon: '🐼' },
    { q: '壁虎尾巴断了为什么动？', a: '那是为了吸引敌人注意好逃跑，断掉的尾巴过阵子还会长出来。', icon: '🦎' },
    { q: '北极熊为什么不吃企鹅？', a: '北极熊住北极，企鹅住南极，它们相隔太远碰不到面。', icon: '🐻' },
    { q: '为什么人会换牙？', a: '小时候的牙太小，长大了需要更坚固、更多的牙来吃东西。', icon: '🦷' },
    { q: '肚子饿了为什么叫？', a: '胃空了还在收缩，里面的空气和水挤来挤去，就发出咕咕声。', icon: '🥣' },
    { q: '人为什么要睡觉？', a: '睡觉是给身体充电，让大脑整理记忆，还能帮小朋友长高。', icon: '😴' },
    { q: '为什么会流眼泪？', a: '眼泪是眼睛的洗澡水，能冲走灰尘，伤心时流泪能缓解情绪。', icon: '💧' },
    { q: '为什么有肚脐眼？', a: '那是出生前连接妈妈的地方，剪断脐带后留下的纪念印记。', icon: '👶' },
    { q: '感冒为什么流鼻涕？', a: '鼻涕是卫兵，感冒时分泌更多是为了冲走细菌和病毒。', icon: '🤧' },
    { q: '跑步心跳为什么快？', a: '跑步需要更多氧气，心脏要快点跳，把血液送到全身加油。', icon: '💓' },
    { q: '为什么人会眨眼？', a: '眨眼是为了涂润滑油保持眼睛湿润，还能挡住小灰尘。', icon: '👁️' },
    { q: '为什么会有指纹？', a: '指纹能增加摩擦力帮我们抓紧东西，而且每个人都不一样。', icon: '☝️' },
    { q: '受伤为什么结痂？', a: '结痂是血小板变出的保护盖，等下面新皮肤长好它就掉了。', icon: '🩹' },
    { q: '为什么会放屁？', a: '肠道细菌分解食物产生气体，积多了就要排出来。', icon: '💨' },
    { q: '舌头为什么尝出味道？', a: '舌头上有味蕾，专门负责尝出酸甜苦咸鲜各种味道。', icon: '👅' },
    { q: '为什么要多喝水？', a: '身体大部分是水，多喝水才能维持工作，让皮肤水灵灵。', icon: '🥤' },
    { q: '冰淇淋为什么会化？', a: '外面温度高，热量跑进冰淇淋里，冰就变成水化掉了。', icon: '🍦' },
    { q: '气球为什么会飞？', a: '气球里充了比空气轻的气体，空气就会把它托向天空。', icon: '🎈' },
    { q: '肥皂为什么能洗干净？', a: '肥皂像小抓手，一手抓水一手抓油，把脏东西带走。', icon: '🧼' },
    { q: '镜子为什么照出人？', a: '镜子平滑且有银层，光照上去原路反射，我们就看到自己。', icon: '🪞' },
    { q: '轮子为什么是圆的？', a: '圆轮滚动阻力小，跑起来又快又平稳。', icon: '🚗' },
    { q: '冬天为什么冒白气？', a: '呼出的热气碰到冷空气，变成小水珠，就成了白气。', icon: '💨' },
    { q: '不倒翁为什么不倒？', a: '它屁股重头轻，重心很低，怎么推都能站起来。', icon: '🎎' },
    { q: '保温瓶为什么保温？', a: '它有两层胆中间真空，热气出不去冷气进不来。', icon: '🍼' },
    { q: '电灯为什么发光？', a: '电流跑过灯丝发热，发出亮亮的光照亮屋子。', icon: '💡' },
    { q: '船为什么浮在水面？', a: '船排开的水产生的浮力比船重，就把船托起来了。', icon: '🚢' },
    { q: '磁铁为什么吸铁？', a: '磁铁有磁力，能把铁吸过去。', icon: '🧲' },
    { q: '影子为什么是黑的？', a: '身体挡住了光，光照不到的地方就是黑黑的影子。', icon: '👤' },
    { q: '为什么看红绿灯？', a: '红灯停绿灯行，遵守规则大家才安全。', icon: '🚦' },
    { q: '面包里为什么有孔？', a: '酵母发酵产生气泡，烤出来就有孔，松软好吃。', icon: '🍞' },
    { q: '汽水为什么冒泡？', a: '汽水里压了气体，打开盖压力变小，气体就跑出来变泡泡。', icon: '🥤' },
    { q: '铅笔为什么写字？', a: '笔芯软软的，在纸上一划就会留下痕迹。', icon: '✏️' },
    { q: '橡皮为什么擦字？', a: '橡皮更有粘性，能把纸上的字迹粘下来。', icon: '🧽' },
    { q: '飞机为什么能上天？', a: '翅膀形状特别，跑快时空气往上托，飞机就飞起来。', icon: '✈️' },
    { q: '手机为什么能通话？', a: '手机把声音变电波传出去，再在对方手机变回声音。', icon: '📱' },
    { q: '潜水艇为什么潜水？', a: '装满水变重就沉，排水变轻就浮。', icon: '🚢' },
    { q: '火箭为什么竖着发？', a: '竖着飞最快穿过大气层，省力又稳当。', icon: '🚀' },
    { q: '宇航员为什么要穿宇航服？', a: '太空没空气且冷热极端，宇航服能保护安全。', icon: '👨‍🚀' },
    { q: '高铁为什么这么快？', a: '车头尖减阻，轨道平直动力强，跑得像飞一样。', icon: '🚄' },
    { q: '为什么有机器人？', a: '机器人帮人类做累活重活，是人类的好助手。', icon: '🤖' },
    { q: '电视里的人怎么动？', a: '快速放连续画面，眼睛看太快就觉得动起来了。', icon: '📺' },
    { q: '冰箱为什么冷？', a: '它把里面的热量搬到外面，里面就变冷了。', icon: '❄️' },
    { q: '空调为什么吹凉风？', a: '它吸走热气吹出冷风，屋里就凉快了。', icon: '🌬️' },
    { q: '为什么有网络？', a: '网络像隐形网，把全世界连在一起传信息。', icon: '🌐' },
    { q: '汽车为什么要加油？', a: '油是汽车的饭，吃了饭才有力气跑路。', icon: '⛽' },
    { q: '红绿灯为什么三色？', a: '红停绿行黄等，颜色显眼好辨认。', icon: '🚥' },
    { q: '为什么垃圾分类？', a: '分类处理能变废为宝，保护我们的地球。', icon: '♻️' },
    { q: '为什么要探索太空？', a: '太空藏着很多秘密，探索是为了满足好奇心。', icon: '🌌' },
  ],
  job: [
    { q: '警察叔叔做什么？', a: '抓坏人，保护大家的安全。', icon: '👮' },
    { q: '医生阿姨做什么？', a: '给人看病，让大家身体健康。', icon: '👩‍⚕️' },
  ]
};

const CULTURE_KNOWLEDGE_BASE = {
  poem: [
    { t: '咏鹅', a: '骆宾王', lines: ['鹅，鹅，鹅，', '曲项向天歌。', '白毛浮绿水，', '红掌拨清波。'], icon: '🦢', audio: '/audio/poems/咏鹅.mp3' },
    { t: '悯农', a: '李绅', lines: ['谁知盘中餐，', '粒粒皆辛苦。'], icon: '🍚', audio: '/audio/poems/悯农.mp3' },
    { t: '画', a: '王维', lines: ['远看山有色，', '近听水无声。', '春去花还在，', '人来鸟不惊。'], icon: '🖼️' },
    { t: '风', a: '李峤', lines: ['过江千尺浪，', '入竹万竿斜。'], icon: '🌬️' },
    { t: '咏柳', a: '贺知章', lines: ['碧玉妆成一树高，', '万条垂下绿丝绦。', '不知细叶谁裁出，', '二月春风似剪刀。'], icon: '🌿' },
    { t: '小池', a: '杨万里', lines: ['泉眼无声惜细流，', '树阴照水爱晴柔。', '小荷才露尖尖角，', '早有蜻蜓立上头。'], icon: '🪷' },
    { t: '所见', a: '袁枚', lines: ['牧童骑黄牛，', '歌声振林樾。', '意欲捕鸣蝉，', '忽然闭口立。'], icon: '🐄' },
    { t: '蜂', a: '罗隐', lines: ['不论平地与山尖，', '无限风光尽被占。', '采得百花成蜜后，', '为谁辛苦为谁甜？'], icon: '🐝' },
    { t: '江雪', a: '柳宗元', lines: ['千山鸟飞绝，', '万径人踪灭。', '孤舟蓑笠翁，', '独钓寒江雪。'], icon: '❄️' },
    { t: '鹿柴', a: '王维', lines: ['空山不见人，', '但闻人语响。', '返景入深林，', '复照青苔上。'], icon: '🌲' },
    { t: '寻隐者不遇', a: '贾岛', lines: ['松下问童子，', '言师采药去。', '只在此山中，', '云深不知处。'], icon: '⛰️' },
    { t: '蚕妇', a: '张俞', lines: ['昨日入城市，', '归来泪满巾。', '遍身罗绮者，', '不是养蚕人。'], icon: '🐛' },
    { t: '草', a: '白居易', lines: ['离离原上草，', '一岁一枯荣。', '野火烧不尽，', '春风吹又生。'], icon: '🌱' },
    { t: '绝句', a: '杜甫', lines: ['两个黄鹂鸣翠柳，', '一行白鹭上青天。', '窗含西岭千秋雪，', '门泊东吴万里船。'], icon: '🐦' },
    { t: '独坐敬亭山', a: '李白', lines: ['众鸟高飞尽，', '孤云独去闲。', '相看两不厌，', '只有敬亭山。'], icon: '🏔️' },
    { t: '春雪', a: '韩愈', lines: ['新年都未有芳华，', '二月初惊见草芽。', '白雪却嫌春色晚，', '故穿庭树作飞花。'], icon: '❄️' },
    { t: '早春呈水部张十八员外', a: '韩愈', lines: ['天街小雨润如酥，', '草色遥看近却无。', '最是一年春好处，', '绝胜烟柳满皇都。'], icon: '🌧️' },
    { t: '秋浦歌', a: '李白', lines: ['白发三千丈，', '缘愁似个长。', '不知明镜里，', '何处得秋霜。'], icon: '🪞' },
    { t: '宿新市徐公店', a: '杨万里', lines: ['篱落疏疏一径深，', '树头花落未成阴。', '儿童急走追黄蝶，', '飞入菜花无处寻。'], icon: '🦋' },
    { t: '村居', a: '高鼎', lines: ['草长莺飞二月天，', '拂堤杨柳醉春烟。', '儿童散学归来早，', '忙趁东风放纸鸢。'], icon: '🪁' },
    { t: '春晓', a: '孟浩然', lines: ['春眠不觉晓，', '处处闻啼鸟。', '夜来风雨声，', '花落知多少。'], icon: '🐦', audio: '/audio/poems/春晓.mp3' },
    { t: '元日', a: '王安石', lines: ['爆竹声中一岁除，', '春风送暖入屠苏。', '千门万户曈曈日，', '总把新桃换旧符。'], icon: '🧨' },
    { t: '清明', a: '杜牧', lines: ['清明时节雨纷纷，', '路上行人欲断魂。', '借问酒家何处有？', '牧童遥指杏花村。'], icon: '🌧️' },
    { t: '夏日绝句', a: '李清照', lines: ['生当作人杰，', '死亦为鬼雄。', '至今思项羽，', '不肯过江东。'], icon: '🗡️' },
    { t: '山行', a: '杜牧', lines: ['远上寒山石径斜，', '白云生处有人家。', '停车坐爱枫林晚，', '霜叶红于二月花。'], icon: '🍁' },
    { t: '九月九日忆山东兄弟', a: '王维', lines: ['独在异乡为异客，', '每逢佳节倍思亲。', '遥知兄弟登高处，', '遍插茱萸少一人。'], icon: '🏔️' },
    { t: '梅花', a: '王安石', lines: ['墙角数枝梅，', '凌寒独自开。', '遥知不是雪，', '为有暗香来。'], icon: '🌸' },
    { t: '晓出净慈寺送林子方', a: '杨万里', lines: ['毕竟西湖六月中，', '风光不与四时同。', '接天莲叶无穷碧，', '映日荷花别样红。'], icon: '🪷' },
    { t: '饮湖上初晴后雨', a: '苏轼', lines: ['水光潋滟晴方好，', '山色空蒙雨亦奇。', '欲把西湖比西子，', '淡妆浓抹总相宜。'], icon: '🌊' },
    { t: '题西林壁', a: '苏轼', lines: ['横看成岭侧成峰，', '远近高低各不同。', '不识庐山真面目，', '只缘身在此山中。'], icon: '🏔️' },
    { t: '惠崇春江晚景', a: '苏轼', lines: ['竹外桃花三两枝，', '春江水暖鸭先知。', '蒌蒿满地芦芽短，', '正是河豚欲上时。'], icon: '🦆' },
    { t: '赠刘景文', a: '苏轼', lines: ['荷尽已无擎雨盖，', '菊残犹有傲霜枝。', '一年好景君须记，', '最是橙黄橘绿时。'], icon: '🍊' },
    { t: '江南春', a: '杜牧', lines: ['千里莺啼绿映红，', '水村山郭酒旗风。', '南朝四百八十寺，', '多少楼台烟雨中。'], icon: '🌧️' },
    { t: '枫桥夜泊', a: '张继', lines: ['月落乌啼霜满天，', '江枫渔火对愁眠。', '姑苏城外寒山寺，', '夜半钟声到客船。'], icon: '🔔' },
    { t: '暮江吟', a: '白居易', lines: ['一道残阳铺水中，', '半江瑟瑟半江红。', '可怜九月初三夜，', '露似真珠月似弓。'], icon: '🌙' },
    { t: '江南', a: '汉乐府', lines: ['江南可采莲，', '莲叶何田田。', '鱼戏莲叶间。', '鱼戏莲叶东，', '鱼戏莲叶西，', '鱼戏莲叶南，', '鱼戏莲叶北。'], icon: '🐟' },
    { t: '敕勒歌', a: '北朝民歌', lines: ['敕勒川，阴山下。', '天似穹庐，笼盖四野。', '天苍苍，野茫茫，', '风吹草低见牛羊。'], icon: '🐑' },
    { t: '凉州词', a: '王翰', lines: ['葡萄美酒夜光杯，', '欲饮琵琶马上催。', '醉卧沙场君莫笑，', '古来征战几人回？'], icon: '🍷' },
    { t: '塞下曲', a: '卢纶', lines: ['月黑雁飞高，', '单于夜遁逃。', '欲将轻骑逐，', '大雪满弓刀。'], icon: '🏹' },
    { t: '逢雪宿芙蓉山主人', a: '刘长卿', lines: ['日暮苍山远，', '天寒白屋贫。', '柴门闻犬吠，', '风雪夜归人。'], icon: '🐕' },
    { t: '静夜思', a: '李白', lines: ['床前明月光，', '疑是地上霜。', '举头望明月，', '低头思故乡。'], icon: '🌙', audio: '/audio/poems/静夜思.mp3' },
    { t: '游子吟', a: '孟郊', lines: ['慈母手中线，', '游子身上衣。', '临行密密缝，', '意恐迟迟归。', '谁言寸草心，', '报得三春晖。'], icon: '🧵' },
    { t: '悯农（其一）', a: '李绅', lines: ['春种一粒粟，', '秋收万颗子。', '四海无闲田，', '农夫犹饿死。'], icon: '🌾' },
    { t: '登鹳雀楼', a: '王之涣', lines: ['白日依山尽，', '黄河入海流。', '欲穷千里目，', '更上一层楼。'], icon: '🏙️' },
    { t: '望庐山瀑布', a: '李白', lines: ['日照香炉生紫烟，', '遥看瀑布挂前川。', '飞流直下三千尺，', '疑是银河落九天。'], icon: '🌊' },
    { t: '赠汪伦', a: '李白', lines: ['李白乘舟将欲行，', '忽闻岸上踏歌声。', '桃花潭水深千尺，', '不及汪伦送我情。'], icon: '🛶' },
    { t: '黄鹤楼送孟浩然之广陵', a: '李白', lines: ['故人西辞黄鹤楼，', '烟花三月下扬州。', '孤帆远影碧空尽，', '唯见长江天际流。'], icon: '⛵' },
    { t: '早发白帝城', a: '李白', lines: ['朝辞白帝彩云间，', '千里江陵一日还。', '两岸猿声啼不住，', '轻舟已过万重山。'], icon: '🚤' },
    { t: '别董大', a: '高适', lines: ['千里黄云白日曛，', '北风吹雁雪纷纷。', '莫愁前路无知己，', '天下谁人不识君。'], icon: '🤝' },
    { t: '送元二使安西', a: '王维', lines: ['渭城朝雨浥轻尘，', '客舍青青柳色新。', '劝君更尽一杯酒，', '西出阳关无故人。'], icon: '🍷' },
    { t: '杂诗', a: '王维', lines: ['君自故乡来，', '应知故乡事。', '来日绮窗前，', '寒梅著花未？'], icon: '🌸' },
    { t: '相思', a: '王维', lines: ['红豆生南国，', '春来发几枝。', '愿君多采撷，', '此物最相思。'], icon: '❤️' },
    { t: '竹里馆', a: '王维', lines: ['独坐幽篁里，', '弹琴复长啸。', '深林人不知，', '明月来相照。'], icon: '🎋' },
    { t: '夜宿山寺', a: '李白', lines: ['危楼高百尺，', '手可摘星辰。', '不敢高声语，', '恐惊天上人。'], icon: '⭐' },
    { t: '问刘十九', a: '白居易', lines: ['绿蚁新醅酒，', '红泥小火炉。', '晚来天欲雪，', '能饮一杯无？'], icon: '🍶' },
    { t: '忆江南', a: '白居易', lines: ['江南好，', '风景旧曾谙。', '日出江花红胜火，', '春来江水绿如蓝。', '能不忆江南？'], icon: '🌺' },
    { t: '回乡偶书', a: '贺知章', lines: ['少小离家老大回，', '乡音无改鬓毛衰。', '儿童相见不相识，', '笑问客从何处来。'], icon: '👴' },
    { t: '出塞', a: '王昌龄', lines: ['秦时明月汉时关，', '万里长征人未还。', '但使龙城飞将在，', '不教胡马度阴山。'], icon: '🛡️' },
    { t: '芙蓉楼送辛渐', a: '王昌龄', lines: ['寒雨连江夜入吴，', '平明送客楚山孤。', '洛阳亲友如相问，', '一片冰心在玉壶。'], icon: '🧊' },
    { t: '凉州词', a: '王之涣', lines: ['黄河远上白云间，', '一片孤城万仞山。', '羌笛何须怨杨柳，', '春风不度玉门关。'], icon: '🏔️' },
    { t: '望天门山', a: '李白', lines: ['天门中断楚江开，', '碧水东流至此回。', '两岸青山相对出，', '孤帆一片日边来。'], icon: '⛰️' },
    { t: '绝句', a: '杜甫', lines: ['迟日江山丽，', '春风花草香。', '泥融飞燕子，', '沙暖睡鸳鸯。'], icon: '🦆' },
    { t: '春夜喜雨', a: '杜甫', lines: ['好雨知时节，', '当春乃发生。', '随风潜入夜，', '润物细无声。'], icon: '🌧️' },
    { t: '江畔独步寻花', a: '杜甫', lines: ['黄四娘家花满蹊，', '千朵万朵压枝低。', '留连戏蝶时时舞，', '自在娇莺恰恰啼。'], icon: '🦋' },
    { t: '浪淘沙', a: '刘禹锡', lines: ['九曲黄河万里沙，', '浪淘风簸自天涯。', '如今直上银河去，', '同到牵牛织女家。'], icon: '🌊' },
    { t: '望洞庭', a: '刘禹锡', lines: ['湖光秋月两相和，', '潭面无风镜未磨。', '遥望洞庭山水翠，', '白银盘里一青螺。'], icon: '🐚' },
    { t: '乌衣巷', a: '刘禹锡', lines: ['朱雀桥边野草花，', '乌衣巷口夕阳斜。', '旧时王谢堂前燕，', '飞入寻常百姓家。'], icon: '🐦' },
    { t: '渔歌子', a: '张志和', lines: ['西塞山前白鹭飞，', '桃花流水鳜鱼肥。', '青箬笠，绿蓑衣，', '斜风细雨不须归。'], icon: '🎣' },
    { t: '滁州西涧', a: '韦应物', lines: ['独怜幽草涧边生，', '上有黄鹂深树鸣。', '春潮带雨晚来急，', '野渡无人舟自横。'], icon: '🚣' },
    { t: '游园不值', a: '叶绍翁', lines: ['应怜屐齿印苍苔，', '小扣柴扉久不开。', '春色满园关不住，', '一枝红杏出墙来。'], icon: '🌸' },
    { t: '秋夕', a: '杜牧', lines: ['银烛秋光冷画屏，', '轻罗小扇扑流萤。', '天阶夜色凉如水，', '卧看牵牛织女星。'], icon: '⭐' },
    { t: '乐游原', a: '李商隐', lines: ['向晚意不适，', '驱车登古原。', '夕阳无限好，', '只是近黄昏。'], icon: '🌇' },
    { t: '金缕衣', a: '杜秋娘', lines: ['劝君莫惜金缕衣，', '劝君惜取少年时。', '花开堪折直须折，', '莫待无花空折枝。'], icon: '👘' },
    { t: '竹石', a: '郑燮', lines: ['咬定青山不放松，', '立根原在破岩中。', '千磨万击还坚劲，', '任尔东西南北风。'], icon: '🎋' },
    { t: '石灰吟', a: '于谦', lines: ['千锤万凿出深山，', '烈火焚烧若等闲。', '粉骨碎身浑不怕，', '要留清白在人间。'], icon: '🪨' },
    { t: '墨梅', a: '王冕', lines: ['我家洗砚池头树，', '朵朵花开淡墨痕。', '不要人夸好颜色，', '只留清气满乾坤。'], icon: '🌸' },
    { t: '题都城南庄', a: '崔护', lines: ['去年今日此门中，', '人面桃花相映红。', '人面不知何处去，', '桃花依旧笑春风。'], icon: '🌸' },
    { t: '泊船瓜洲', a: '王安石', lines: ['京口瓜洲一水间，', '钟山只隔数重山。', '春风又绿江南岸，', '明月何时照我还。'], icon: '🌕' },
    { t: '登飞来峰', a: '王安石', lines: ['飞来山上千寻塔，', '闻说鸡鸣见日升。', '不畏浮云遮望眼，', '自缘身在最高层。'], icon: '🗼' },
    { t: '示儿', a: '陆游', lines: ['死去元知万事空，', '但悲不见九州同。', '王师北定中原日，', '家祭无忘告乃翁。'], icon: '📜' },
    { t: '剑客', a: '贾岛', lines: ['十年磨一剑，', '霜刃未曾试。', '今日把示君，', '谁有不平事？'], icon: '⚔️' },
    { t: '听弹琴', a: '刘长卿', lines: ['泠泠七弦上，', '静听松风寒。', '古调虽自爱，', '今人多不弹。'], icon: '🎵' },
    { t: '采莲曲', a: '王昌龄', lines: ['荷叶罗裙一色裁，', '芙蓉向脸两边开。', '乱入池中看不见，', '闻歌始觉有人来。'], icon: '👗' },
    { t: '宫词', a: '顾况', lines: ['玉楼天半起笙歌，', '风送宫嫔笑语和。', '月殿影开闻夜漏，', '水晶帘卷近秋河。'], icon: '🏰' },
    { t: '哥舒歌', a: '西鄙人', lines: ['北斗七星高，', '哥舒夜带刀。', '至今窥牧马，', '不敢过临洮。'], icon: '⭐' },
    { t: '秋风引', a: '刘禹锡', lines: ['何处秋风至？', '萧萧送雁群。', '朝来入庭树，', '孤客最先闻。'], icon: '🍂' },
    { t: '渡汉江', a: '宋之问', lines: ['岭外音书断，', '经冬复历春。', '近乡情更怯，', '不敢问来人。'], icon: '✉️' },
    { t: '长干行', a: '李白', lines: ['妾发初覆额，', '折花门前剧。', '郎骑竹马来，', '绕床弄青梅。'], icon: '🐎' },
    { t: '越女词', a: '李白', lines: ['耶溪采莲女，', '见客棹歌回。', '笑入荷花去，', '佯羞不出来。'], icon: '🛶' },
    { t: '赠花卿', a: '杜甫', lines: ['锦城丝管日纷纷，', '半入江风半入云。', '此曲只应天上有，', '人间能得几回闻。'], icon: '🎶' },
    { t: '漫兴', a: '杜甫', lines: ['肠断春江欲尽头，', '杖藜徐步立芳洲。', '癫狂柳絮随风舞，', '轻薄桃花逐水流。'], icon: '🌸' },
    { t: '八阵图', a: '杜甫', lines: ['功盖三分国，', '名成八阵图。', '江流石不转，', '遗恨失吞吴。'], icon: '🗺️' },
    { t: '晚春', a: '韩愈', lines: ['草树知春不久归，', '百般红紫斗芳菲。', '杨花榆荚无才思，', '惟解漫天作雪飞。'], icon: '❄️' },
    { t: '淮上与友人别', a: '郑谷', lines: ['扬子江头杨柳春，', '杨花愁杀渡江人。', '数声风笛离亭晚，', '君向潇湘我向秦。'], icon: '👋' },
    { t: '玉台体', a: '权德舆', lines: ['昨夜裙带解，', '今朝蟢子飞。', '铅华不可弃，', '莫是藁砧归。'], icon: '🕷️' },
    { t: '听筝', a: '李端', lines: ['鸣筝金粟柱，', '素手玉房前。', '欲得周郎顾，', '时时误拂弦。'], icon: '🎼' },
    { t: '寒食', a: '韩翃', lines: ['春城无处不飞花，', '寒食东风御柳斜。', '日暮汉宫传蜡烛，', '轻烟散入五侯家。'], icon: '🕯️' },
    { t: '军城早秋', a: '严武', lines: ['昨夜秋风入汉关，', '朔云边月满西山。', '更催飞将追骄虏，', '莫遣沙场匹马还。'], icon: '🌕' },
    { t: '归雁', a: '钱起', lines: ['潇湘何事等闲回？', '水碧沙明渐照堆。', '二十五弦弹夜月，', '不胜清怨却飞来。'], icon: '🦢' },
  ],
  song: [
    { t: '小兔子乖乖', a: '儿歌', lines: ['小兔子乖乖，把门儿开开，', '快点儿开开，我要进来。', '不开不开我不开，', '妈妈没回来，谁来也不开。', '小兔子乖乖，把门儿开开，', '快点儿开开，我要进来。', '就开就开我就开，', '妈妈回来了，快点儿把门开。'], icon: '🐰', audio: '/audio/小兔子乖乖.mp3' },
    // 💡 提示：如果使用本地音频，请将文件放入 public/audio/ 目录，然后像这样引用： audio: '/audio/两只老虎.mp3'
    { t: '两只老虎', a: '儿歌', lines: ['两只老虎，两只老虎，', '跑得快，跑得快。', '一只没有耳朵，', '一只没有尾巴，', '真奇怪，真奇怪。'], icon: '🐯', audio: '/audio/两只老虎.mp3' },
    { t: '数鸭子', a: '儿歌', lines: ['门前大桥下，游过一群鸭。', '快来快来数一数，', '二四六七八。', '嘎嘎嘎嘎，真呀真多呀。', '数鸭子的小朋友，', '鸭子向你点头。'], icon: '🦆', audio: '/audio/数鸭子.mp3' },
    { t: '拔萝卜', a: '儿歌', lines: ['拔萝卜，拔萝卜。', '嘿哟嘿哟，拔萝卜，', '嘿哟嘿哟，拔不动。', '老太婆，快快来，', '快来帮我们拔萝卜。'], icon: '🥕', audio: '/audio/拔萝卜.mp3' },
    { t: '小毛驴', a: '儿歌', lines: ['我有一只小毛驴我从来也不骑，', '有一天我心血来潮骑着去赶集。', '我手里拿着小皮鞭我心里正得意，', '不知怎么哗啦啦啦啦，摔了一身泥。'], icon: '🐴', audio: '/audio/小毛驴.mp3' },
    { t: '一分钱', a: '儿歌', lines: ['我在马路边，捡到一分钱，', '把它交到警察叔叔手里边。', '叔叔拿着钱，对我把头点，', '我高兴地说了声：叔叔，再见！'], icon: '👮', audio: '/audio/一分钱.mp3' },
    { t: '找朋友', a: '儿歌', lines: ['找呀找呀找朋友，', '找到一个好朋友。', '敬个礼，握握手，', '你是我的好朋友。', '再见！'], icon: '🤝', audio: '/audio/找朋友.mp3' },
    { t: '丢手绢', a: '儿歌', lines: ['丢，丢，丢手绢，', '轻轻地放在小朋友的后面，', '大家不要告诉他，', '快点快点捉住他，', '快点快点捉住他。'], icon: '🧣', audio: '/audio/丢手绢.mp3' },
    { t: '上学歌', a: '儿歌', lines: ['太阳当空照，花儿对我笑，', '小鸟说早早早，', '你为什么背上小书包？', '我去上学校，天天不迟到，', '爱学习爱劳动，', '长大要为人民立功劳。'], icon: '🎒', audio: '/audio/上学歌.mp3' },
    { t: '我的好妈妈', a: '儿歌', lines: ['我的好妈妈，下班回到家，', '劳动了一天，多么辛苦呀。', '妈妈妈妈快坐下，', '妈妈妈妈快坐下，', '请喝一杯茶，', '让我亲亲你吧，', '让我亲亲你吧，我的好妈妈。'], icon: '👩', audio: '/audio/我的好妈妈.mp3' },
    { t: '小燕子', a: '儿歌', lines: ['小燕子，穿花衣，', '年年春天来这里。', '我问燕子你为啥来？', '燕子说：这里的春天最美丽。'], icon: '🕊️' },
    { t: '卖报歌', a: '儿歌', lines: ['啦啦啦！啦啦啦！', '我是卖报的小行家。', '不等天明去等派报，', '一面走，一面叫，', '今天的新闻真正好，', '七个铜板就买两份报。'], icon: '📰' },
    { t: '娃哈哈', a: '儿歌', lines: ['我们的祖国是花园，', '花园里花朵真鲜艳。', '和暖的阳光照耀着我们，', '每个人脸上都笑开颜。', '娃哈哈，娃哈哈，', '每个人脸上都笑开颜。'], icon: '🌺' },
    { t: '生日快乐', a: '儿歌', lines: ['祝你生日快乐，', '祝你生日快乐，', '祝你生日快乐，', '祝你生日快乐。'], icon: '🎂' },
    { t: '小二郎', a: '儿歌', lines: ['小呀嘛小二郎，', '背着书包上学堂。', '不怕太阳晒，也不怕风雨狂，', '只怕先生骂我懒，', '没有学问无颜见爹娘。'], icon: '👦' },
    { t: '泥娃娃', a: '儿歌', lines: ['泥娃娃，泥娃娃，一个泥娃娃。', '也有那眉毛，也有那眼睛，', '眼睛不会眨。', '泥娃娃，泥娃娃，一个泥娃娃。', '也有那鼻子，也有那嘴巴，', '嘴巴不说话。'], icon: '🎎' },
    { t: '春天在哪里', a: '儿歌', lines: ['春天在哪里呀，春天在哪里？', '春天在那青翠的山林里。', '这里有红花呀，这里有绿草，', '还有那会唱歌的小黄鹂。'], icon: '🌱' },
    { t: '世上只有妈妈好', a: '儿歌', lines: ['世上只有妈妈好，', '有妈的孩子像块宝，', '投进妈妈的怀抱，幸福享不了。', '世上只有妈妈好，', '没妈的孩子像根草，', '离开妈妈的怀抱，幸福哪里找？'], icon: '🤱' },
    { t: '打电话', a: '儿歌', lines: ['两个小娃娃呀，', '正在打电话呀。', '喂喂喂，你在哪里呀？', '喂喂喂，我在幼儿园。'], icon: '📞' },
    { t: '排排坐', a: '儿歌', lines: ['排排坐，吃果果，', '你一个，我一个，', '弟弟睡了留一个。'], icon: '🍎' },
    { t: '小青蛙', a: '儿歌', lines: ['一只青蛙一张嘴，', '两只眼睛四条腿，', '扑通一声跳下水。', '两只青蛙两张嘴，', '四只眼睛八条腿，', '扑通扑通跳下水。'], icon: '🐸' },
    { t: '小老鼠上灯台', a: '儿歌', lines: ['小老鼠，上灯台，', '偷油吃，下不来。', '喵喵喵，猫来了，', '叽里咕噜滚下来。'], icon: '🐭' },
    { t: '蜗牛与黄鹂鸟', a: '儿歌', lines: ['阿门阿前一棵葡萄树，', '阿嫩阿嫩绿地刚发芽。', '蜗牛背着那重重的壳呀，', '一步一步地往上爬。'], icon: '🐌' },
    { t: '大象', a: '儿歌', lines: ['大象大象，', '你的鼻子怎么那么长？', '妈妈说鼻子长才是漂亮。'], icon: '🐘' },
    { t: '小蜻蜓', a: '儿歌', lines: ['小蜻蜓，是益虫，', '飞到西来飞到东。', '不吃粮食不吃菜，', '专吃蚊子和害虫。'], icon: '🐉' },
    { t: '公鸡喔喔叫', a: '儿歌', lines: ['大公鸡，喔喔叫，', '外面的世界真美妙。', '小朋友们起得早，', '锻炼身体身体好。'], icon: '🐓' },
    { t: '小花猫', a: '儿歌', lines: ['小花猫，喵喵喵，', '饿了肚子咕咕叫。', '看见老鼠捉一只，', '放下老鼠喵喵叫。'], icon: '🐱' },
    { t: '蝴蝶飞飞', a: '儿歌', lines: ['蝴蝶飞，蝴蝶飞，', '蝴蝶飞在花丛中。', '飞得低，飞得高，', '飞到东来飞到西。'], icon: '🦋' },
    { t: '螃蟹歌', a: '儿歌', lines: ['螃蟹一呀爪八个，', '两头尖尖这么大个。', '眼一挤呀脖一缩，', '爬呀爬呀过沙河。'], icon: '🦀' },
    { t: '小白兔白又白', a: '儿歌', lines: ['小白兔，白又白，', '两只耳朵竖起来。', '爱吃萝卜爱吃菜，', '蹦蹦跳跳真可爱。'], icon: '🐰' },
    { t: '小蜜蜂', a: '儿歌', lines: ['嗡嗡嗡，嗡嗡嗡，', '大家一起勤做工。', '来匆匆，去匆匆，', '做工兴味浓。'], icon: '🐝' },
    { t: '小鸭子', a: '儿歌', lines: ['小鸭子，嘎嘎嘎，', '游到水里捉鱼虾。', '捉到鱼虾给妈妈，', '妈妈夸我好娃娃。'], icon: '🦆' },
    { t: '小乌龟', a: '儿歌', lines: ['小乌龟，爬呀爬，', '背着房子去安家。', '不怕风，不怕雨，', '累了就把头缩下。'], icon: '🐢' },
    { t: '大白鹅', a: '儿歌', lines: ['大白鹅，大白鹅，', '不脱衣服就下河。', '荡起双桨划呀划，', '就像一只小游船。'], icon: '🦢' },
    { t: '小猴子', a: '儿歌', lines: ['小猴子，吱吱叫，', '肚子饿了不能跳。', '给香蕉，还不要，', '你说好笑不好笑。'], icon: '🐒' },
    { t: '小猪吃得饱饱', a: '儿歌', lines: ['小猪吃得饱饱，', '闭着眼睛睡觉。', '大耳朵在扇扇，', '小尾巴在摇摇。'], icon: '🐷' },
    { t: '小金鱼', a: '儿歌', lines: ['一条小金鱼，水里游呀游。', '孤孤单单在发愁。', '两条小金鱼，水里游呀游。', '摇摇尾巴点点头。'], icon: '🐠' },
    { t: '小企鹅', a: '儿歌', lines: ['小企鹅，穿黑衣，', '白白肚皮真神气。', '走起路来摇又摆，', '冰天雪地去游戏。'], icon: '🐧' },
    { t: '布谷鸟', a: '儿歌', lines: ['布谷布谷，布谷布谷，', '我在唱歌，你在跳舞。'], icon: '🐦' },
    { t: '小松鼠', a: '儿歌', lines: ['小松鼠，大尾巴，', '一蹦一跳采松果。', '冬天来了雪花飘，', '躲在洞里吃松果。'], icon: '🐿️' },
    { t: '刷牙歌', a: '儿歌', lines: ['小牙刷，手中拿，', '张开我的小嘴巴。', '上下刷，左右刷，', '牙齿洁白人人夸。'], icon: '🪥' },
    { t: '洗手歌', a: '儿歌', lines: ['卷起小袖子，打开水龙头。', '抹抹小肥皂，搓搓手心背，', '清水冲干净，毛巾擦一擦。'], icon: '🧼' },
    { t: '饭前要洗手', a: '儿歌', lines: ['吃饭前，要洗手，', '细菌病毒不入口。', '干干净净吃得香，', '身体健康不用愁。'], icon: '🍚' },
    { t: '早睡早起', a: '儿歌', lines: ['晚上早早睡，白天早早起。', '闹钟叮铃铃，被窝不留恋。'], icon: '⏰' },
    { t: '穿衣歌', a: '儿歌', lines: ['抓领子，盖房子。', '小老鼠，钻洞子。', '左钻钻，右钻钻，', '吱吱吱吱上房子。'], icon: '👕' },
    { t: '不挑食', a: '儿歌', lines: ['小小筷子手中拿，', '蔬菜水果都爱它。', '一口饭，一口菜，', '身体强壮人人夸。'], icon: '🥦' },
    { t: '说声谢谢你', a: '儿歌', lines: ['接受帮助说谢谢，', '得到礼物说谢谢。', '谢谢你，不客气，', '文明礼貌要牢记。'], icon: '🙏' },
    { t: '自己走路', a: '儿歌', lines: ['妈妈，妈妈，你别抱，', '自己走路身体好。', '跑跑跳跳多开心，', '我是勇敢小宝宝。'], icon: '🚶' },
    { t: '洗澡歌', a: '儿歌', lines: ['噜啦啦噜啦啦，噜啦噜啦咧。', '我爱洗澡皮肤好好，', '带上浴帽蹦蹦跳跳。'], icon: '🛀' },
    { t: '问候歌', a: '儿歌', lines: ['早上好，老师早。', '见到同学问声好。', '礼貌用语挂嘴边，', '大家夸我好宝宝。'], icon: '👋' },
    { t: '过马路', a: '儿歌', lines: ['大马路，宽又宽，', '警察叔叔站中间。', '红灯停，绿灯行，', '斑马线上慢慢行。'], icon: '🚦' },
    { t: '剪指甲', a: '儿歌', lines: ['指甲长了要剪掉，', '细菌无处藏。', '勤剪指甲讲卫生，', '做个健康好宝宝。'], icon: '💅' },
    { t: '收拾玩具', a: '儿歌', lines: ['玩具玩好送回家，', '整整齐齐排排坐。', '下次玩时方便找，', '养成习惯真正好。'], icon: '🧸' },
    { t: '睡午觉', a: '儿歌', lines: ['小花猫，睡午觉，', '静悄悄，不吵闹。', '我们也来睡午觉，', '身体棒棒长得高。'], icon: '😴' },
    { t: '爱护小眼睛', a: '儿歌', lines: ['小眼睛，亮晶晶，', '样样东西看得清。', '好孩子，讲卫生，', '不用脏手揉眼睛。'], icon: '👁️' },
    { t: '坐坐好', a: '儿歌', lines: ['小脚并拢手放好，', '眼睛看前不乱跑。', '老师讲课认真听，', '做个聪明好宝宝。'], icon: '🪑' },
    { t: '大家分享', a: '儿歌', lines: ['好东西，大家吃，', '好玩具，大家玩。', '你让我，我让你，', '好朋友，在一起。'], icon: '🍰' },
    { t: '节约用水', a: '儿歌', lines: ['水龙头，哗哗流，', '洗完小手要关头。', '节约用水从我做，', '点点滴滴不流走。'], icon: '🚰' },
    { t: '垃圾扔进桶', a: '儿歌', lines: ['小小纸片不乱扔，', '果皮垃圾进纸篓。', '环境优美靠大家，', '做个文明小帮手。'], icon: '🗑️' },
    { t: '对不起没关系', a: '儿歌', lines: ['做错事情对不起，', '原谅别人没关系。', '礼貌用语暖人心，', '团结友爱在一起。'], icon: '❤️' },
    { t: '五指歌', a: '儿歌', lines: ['一二三四五，上山打老虎。', '老虎不在家，打到小松鼠。', '松鼠有几只？让我数一数。'], icon: '🖐️' },
    { t: '小星星', a: '儿歌', lines: ['一闪一闪亮晶晶，', '满天都是小星星。', '挂在天上放光明，', '好像许多小眼睛。'], icon: '⭐' },
    { t: '找春天', a: '儿歌', lines: ['春天在哪里呀，春天在哪里？', '春天在那青翠的山林里。'], icon: '🌸' },
    { t: '下雨了', a: '儿歌', lines: ['滴答滴答，下雨了，', '滴答滴答，下雨了。', '种子说：下吧下吧，我要发芽。'], icon: '🌧️' },
    { t: '雪地里的小画家', a: '儿歌', lines: ['下雪啦，下雪啦！', '雪地里来了一群小画家。', '小鸡画竹叶，小狗画梅花，', '小鸭画枫叶，小马画月牙。'], icon: '❄️' },
    { t: '四季歌', a: '儿歌', lines: ['春天花儿开，夏天蝉儿叫，', '秋天落叶飘，冬天雪花飞。'], icon: '🍂' },
    { t: '数字歌', a: '儿歌', lines: ['1像铅笔能写字，', '2像小鸭水上游，', '3像耳朵听声音，', '4像小旗迎风飘。'], icon: '🔢' },
    { t: '颜色歌', a: '儿歌', lines: ['红色的苹果圆又圆，', '黄色的香蕉弯又弯，', '紫色的葡萄一串串，', '绿色的西瓜甜又甜。'], icon: '🎨' },
    { t: '太阳公公', a: '儿歌', lines: ['太阳公公起得早，', '他怕宝宝睡懒觉。', '爬上窗口瞧一瞧，', '咦？宝宝不见了。'], icon: '☀️' },
    { t: '月亮婆婆', a: '儿歌', lines: ['月亮婆婆，喜欢我，', '洒下月光，陪着我。'], icon: '🌙' },
    { t: '大苹果', a: '儿歌', lines: ['我是一个大苹果，', '小朋友们都爱我。', '请你先去洗洗手，', '要是手脏别碰我。'], icon: '🍎' },
    { t: '看红绿灯', a: '儿歌', lines: ['爸爸开车我坐车，', '十字路口看信号。', '红灯停，绿灯行，', '黄灯亮了等一等。'], icon: '🚥' },
    { t: '五官歌', a: '儿歌', lines: ['小小鼻子闻香气，', '小小嘴巴吃东西，', '小小耳朵听声音，', '小小眼睛看东西。'], icon: '👃' },
    { t: '左右歌', a: '儿歌', lines: ['伸出你的左手，', '伸出你的右手，', '左手右手拍一拍，', '大家都是好朋友。'], icon: '✋' },
    { t: '高和矮', a: '儿歌', lines: ['长颈鹿，个子高，', '小花猫，个子矮。', '高高矮矮在一起，', '大家都是好朋友。'], icon: '📏' },
    { t: '大和小', a: '儿歌', lines: ['西瓜大，苹果小。', '大象大，蚂蚁小。', '大大小小比一比，', '世界真奇妙。'], icon: '⚖️' },
    { t: '吹泡泡', a: '儿歌', lines: ['吹泡泡，吹泡泡，', '泡泡飞得高又高。', '有的圆，有的扁，', '五颜六色真好看。'], icon: '🫧' },
    { t: '七色光', a: '儿歌', lines: ['太阳公公起得早，', '七色光芒照大地。', '赤橙黄绿青蓝紫，', '美丽彩虹挂天边。'], icon: '🌈' },
    { t: '东南西北', a: '儿歌', lines: ['早晨起床，面向太阳。', '前面是东，后面是西，', '左面是北，右面是南。'], icon: '🧭' },
    { t: '时钟歌', a: '儿歌', lines: ['滴答滴答，滴答滴答，', '会走没有腿，会说没有嘴。', '它会告诉我们，', '什么时候起，什么时候睡。'], icon: '🕒' },
    { t: '拍手歌', a: '儿歌', lines: ['你拍一，我拍一，', '一个小孩坐飞机。', '你拍二，我拍二，', '两个小孩丢手绢。', '你拍三，我拍三，', '三个小孩吃饼干。'], icon: '👏' },
    { t: '如果感到幸福', a: '儿歌', lines: ['如果感到幸福你就拍拍手，', '如果感到幸福你就拍拍手。', '如果感到幸福就快快拍拍手呀，', '看哪大家多欢喜。'], icon: '😊' },
    { t: '身体歌', a: '儿歌', lines: ['头、肩膀、膝盖、脚，膝盖、脚。', '头、肩膀、膝盖、脚，膝盖、脚。', '眼、耳、鼻和口。'], icon: '💃' },
    { t: '拔萝卜(互动版)', a: '儿歌', lines: ['嘿哟嘿哟拔萝卜，', '大家一起来加油！'], icon: '🥕' },
    { t: '虫儿飞', a: '儿歌', lines: ['黑黑的天空低垂，', '亮亮的繁星相随。', '虫儿飞，虫儿飞，', '你在思念谁。'], icon: '🐛' },
    { t: '劳动最光荣', a: '儿歌', lines: ['太阳光金亮亮，雄鸡唱三唱。', '花儿醒来了，鸟儿忙梳妆。', '小喜鹊造新房，小蜜蜂采蜜糖。'], icon: '⚒️' },
    { t: '采蘑菇的小姑娘', a: '儿歌', lines: ['采蘑菇的小姑娘，', '背着一个大竹筐。', '清早光着小脚丫，', '走遍树林和山冈。'], icon: '🍄' },
    { t: '歌声与微笑', a: '儿歌', lines: ['请把我的歌带回你的家，', '请把你的微笑留下。'], icon: '🎤' },
    { t: '鲁冰花', a: '儿歌', lines: ['天上的星星不说话，', '地上的娃娃想妈妈。', '天上的眼睛眨呀眨，', '妈妈的心呀鲁冰花。'], icon: '🌺' },
    { t: '大头儿子小头爸爸', a: '儿歌', lines: ['大头儿子，小头爸爸，', '一对好朋友，快乐父子俩。'], icon: '👪' },
    { t: '健康歌', a: '儿歌', lines: ['左三圈，右三圈，', '脖子扭扭，屁股扭扭。', '早睡早起，咱们来做运动。'], icon: '🤸' },
    { t: '捉迷藏', a: '儿歌', lines: ['蒙上眼睛捉迷藏，', '东摸摸，西摸摸，', '摸到一个小伙伴，猜猜他是谁？'], icon: '🙈' },
    { t: '老鹰捉小鸡', a: '儿歌', lines: ['老鹰捉小鸡，哎哟哎哟真着急。', '躲在母鸡身后边，', '大家一起做游戏。'], icon: '🦅' },
    { t: '丢手绢(互动版)', a: '儿歌', lines: ['大家围成圆圈圈，丢手绢，', '抓坏蛋，跑得快，抓得住。'], icon: '🧣' },
    { t: '摇篮曲', a: '儿歌', lines: ['睡吧，睡吧，我亲爱的宝贝。', '妈妈的双手轻轻摇着你。'], icon: '👶' },
    { t: '小星星(英文版)', a: '儿歌', lines: ['Twinkle, twinkle, little star,', 'How I wonder what you are!'], icon: '⭐' },
    { t: 'Bingo', a: '儿歌', lines: ['There was a farmer had a dog,', 'And Bingo was his name-o.'], icon: '🐶' },
    { t: '划船歌', a: '儿歌', lines: ['Row, row, row your boat,', 'Gently down the stream.', 'Merrily, merrily, merrily, merrily,', 'Life is but a dream.'], icon: '🚣' },
    { t: '新年好', a: '儿歌', lines: ['新年好呀，新年好呀，', '祝福大家新年好。', '我们唱歌，我们跳舞，', '祝福大家新年好。'], icon: '🧧' },
    { t: '送别', a: '儿歌', lines: ['长亭外，古道边，芳草碧连天。', '晚风拂柳笛声残，夕阳山外山。'], icon: '🌅' },
  ],
  // ...
};

const STORY_ELEMENTS = {
  protagonist: ['勇敢的小狗', '聪明的小猫', '迷糊的小鸭', '善良的小熊', '神奇的机器人', '害羞的兔子', '大力士蚂蚁'],
  location: ['魔法森林', '彩虹城堡', '深海宫殿', '糖果星球', '云朵之上', '神秘山洞', '未来城市'],
  villain: ['贪吃的大灰狼', '捣蛋的狐狸', '爱睡觉的巨龙', '偷东西的乌鸦', '骄傲的孔雀'],
  plot: ['寻找失落的宝石', '拯救被困的公主', '参加盛大的舞会', '学习飞行的本领', '解开古老的谜题', '举办森林运动会'],
  ending: ['他们成为了最好的朋友。', '大家都过上了幸福的生活。', '这个秘密只有天上的星星知道。', '这是一个多么神奇的冒险啊！', '它终于明白了自己的独特之处。']
};

// --- 辅助函数 ---
function shuffle(array: any[]) {
  const arr = [...array];
  let currentIndex = arr.length,  randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

// --- 生成器函数 ---

// 1. [升级] 单词生成器 - 组合生成法
export const generateWordCards = (count: number = 50, age: number = 4, category?: WordCategory): WordCard[] => {
  const cards: WordCard[] = [];
  
  // 1. 获取基础词汇
  const targetCategories = category ? [category] : (Object.keys(baseWords) as Array<keyof typeof baseWords>);
  const baseItems: any[] = [];
  targetCategories.forEach(cat => {
    // @ts-ignore
    const items = baseWords[cat];
    if (items) items.forEach((item: any) => { if (item.level <= age + 1) baseItems.push({ ...item, category: cat }); });
  });

  // 2. 如果请求数量小于基础词汇量，直接随机返回
  if (count <= baseItems.length) {
    return shuffle(baseItems).slice(0, count).map((item, idx) => ({
      id: `word_${idx}`,
      word: item.en,
      translation: item.zh,
      image: item.emoji,
      category: item.category
    }));
  }

  // 3. 如果请求数量大，开启“组合模式” (Adjective + Noun)
  // 例如：Red Apple, Big Elephant
  for (let i = 0; i < count; i++) {
    const item = baseItems[i % baseItems.length];
    
    // 30% 概率生成组合词，70% 概率生成基础词（带编号以去重）
    if (Math.random() > 0.3) {
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      cards.push({
        id: `word_combo_${i}`,
        word: `${adj.en} ${item.en}`,
        translation: `${adj.cn}${item.zh}`,
        image: item.emoji,
        category: item.category
      });
    } else {
      cards.push({
        id: `word_base_${i}`,
        word: item.en,
        translation: item.zh,
        image: item.emoji,
        category: item.category
      });
    }
  }
  
  return cards;
};

// 2. [升级] 逻辑生成器 (算法生成，本身支持无限)
// ... (保留 generateLogicLevels, generatePattern 等，它们已经是算法生成的，只需确保 count 被尊重)
// (此处省略重复代码，假设已包含)

// 3. [升级] 科学生成器 - 混合 知识库 + 逻辑推断
export const generateScienceCards = (category?: ScienceCategory, count: number = 100): ScienceCard[] => {
  const cards: ScienceCard[] = [];
  const categories = category ? [category] : ['knowledge', 'job', 'space', 'animal_fact'];
  
  for (let i = 0; i < count; i++) {
    const cat = categories[i % categories.length] as ScienceCategory;
    
    // 策略 A: 优先从精品知识库取 (30%)
    // @ts-ignore
    const kb = SCIENCE_KNOWLEDGE_BASE[cat];
    if (kb && Math.random() < 0.3) {
      const item = kb[Math.floor(Math.random() * kb.length)];
      cards.push({ 
        id: `sci_kb_${i}`, title: item.q, content: item.a, image: item.icon, category: cat 
      });
      continue;
    }

    // 策略 B: 逻辑推断生成 (70%) - 确保符合常理
    let title = '', content = '', image = '❓';

    if (cat === 'animal_fact') {
      const a1 = ENTITIES.animals[Math.floor(Math.random() * ENTITIES.animals.length)];
      const a2 = ENTITIES.animals[Math.floor(Math.random() * ENTITIES.animals.length)];
      
      // 生成比较类知识
      if (a1.size > a2.size * 2) {
        title = `谁更大：${a1.name}还是${a2.name}？`;
        content = `当然是${a1.name}啦！它的体型比${a2.name}大得多。`;
        image = a1.emoji;
      } else if (a1.speed > a2.speed * 1.5) {
        title = `谁跑得快：${a1.name}还是${a2.name}？`;
        content = `${a1.name}跑得更快哦！`;
        image = a1.emoji;
      } else {
        title = `${a1.name}吃什么？`;
        content = `${a1.name}是${a1.diet === 'herbivore' ? '吃草' : '吃肉'}的动物。`;
        image = a1.emoji;
      }
    } else if (cat === 'space') {
       const planet = ['火星', '金星', '木星'][Math.floor(Math.random() * 3)];
       title = `${planet}上有外星人吗？`;
       content = `目前科学家还没有在${planet}上发现外星人哦。`;
       image = '👽';
    } else {
       // 默认 fallback
       title = `我们要爱护环境吗？`;
       content = `当然要！爱护花草树木，地球才会更美丽。`;
       image = '🌍';
    }

    cards.push({ 
      id: `sci_gen_${i}`, title, content, image, category: cat 
    });
  }
  return cards;
};

// 4. [升级] 文化生成器 - 混合 经典 + 问答
export const generateCultureCards = (category?: CultureCategory, count: number = 100): CultureCard[] => {
  const cards: CultureCard[] = [];
  const categories = category ? [category] : ['poem', 'song', 'idiom'];
  
  // 基础数据展平
  const allBaseItems: any[] = [];
  categories.forEach(cat => {
    // 动态注入贝乐虎儿歌
    if (cat === 'song') {
       // 优先使用下载的贝乐虎儿歌
       // @ts-ignore
       if (BEILEHU_SONGS && BEILEHU_SONGS.length > 0) {
          BEILEHU_SONGS.forEach((song: any) => allBaseItems.push({ ...song, category: 'song' }));
       } else {
          // 降级使用原来的数据
          // @ts-ignore
          const items = CULTURE_KNOWLEDGE_BASE[cat];
          if (items) items.forEach((item: any) => allBaseItems.push({ ...item, category: cat }));
       }
    } else {
        // @ts-ignore
        const items = CULTURE_KNOWLEDGE_BASE[cat];
        if (items) items.forEach((item: any) => allBaseItems.push({ ...item, category: cat }));
    }
  });

  for (let i = 0; i < count; i++) {
    const item = allBaseItems[i % allBaseItems.length];
    
    // 策略 A: 展示原文 (50%)
    if (Math.random() < 0.5 || item.category === 'song') { // 儿歌总是展示原文
      cards.push({ 
        id: `cul_base_${i}`, 
        title: item.t || item.w, 
        author: item.a, 
        content: item.lines || [item.m], 
        image: item.icon || '🎵', // 确保有图标
        category: item.category,
        audio: item.audio, // 传递音频链接
        cover: item.cover // 传递封面链接
      });
    } else {
      // 策略 B: 生成问答卡 (50%)
      // 例如：谁写了《静夜思》？
      if (item.category === 'poem') {
        cards.push({
          id: `cul_quiz_${i}`,
          title: `谁写了《${item.t}》？`,
          author: '小智老师提问',
          content: [`答案是：${item.a}`, `(${item.lines[0]}...)`],
          image: '❓',
          category: 'poem'
        });
      } else {
        // 复用原文，避免无法生成
        cards.push({ 
            id: `cul_base_rep_${i}`, 
            title: item.t || item.w, 
            author: item.a, 
            content: item.lines || [item.m], 
            image: item.icon, 
            category: item.category 
        });
      }
    }
  }
  return cards;
};

// 5. [升级] 故事生成器 - 组合爆炸 + 经典故事库
export const generateStories = (count: number = 100): StoryCard[] => {
  const stories: StoryCard[] = [];
  
  // 1. 优先使用经典故事
  const classicCount = Math.min(count, CLASSIC_STORIES.length);
  const shuffledClassics = shuffle(CLASSIC_STORIES);
  
  for (let i = 0; i < classicCount; i++) {
    stories.push({
      ...shuffledClassics[i],
      id: `story_classic_${i}_${Date.now()}`
    });
  }

  // 2. 如果请求数量超过经典故事库，使用自动生成补充
  if (count > classicCount) {
    const genCount = count - classicCount;
    for (let i = 0; i < genCount; i++) {
        // 随机抽取元素
        const p = STORY_ELEMENTS.protagonist[Math.floor(Math.random() * STORY_ELEMENTS.protagonist.length)];
        const l = STORY_ELEMENTS.location[Math.floor(Math.random() * STORY_ELEMENTS.location.length)];
        const v = STORY_ELEMENTS.villain[Math.floor(Math.random() * STORY_ELEMENTS.villain.length)];
        const plot = STORY_ELEMENTS.plot[Math.floor(Math.random() * STORY_ELEMENTS.plot.length)];
        const end = STORY_ELEMENTS.ending[Math.floor(Math.random() * STORY_ELEMENTS.ending.length)];

        // 生成标题
        const title = `${p}在${l}`;
        const summary = `${p}去${l}冒险，遇到了${v}，发生了一系列有趣的故事...`;
        
        // 生成内容
        const pages = [
        `从前，有一只${p}。`,
        `有一天，它决定去${l}探险。`,
        `在路上，它遇到了${v}，${v}想阻拦它。`,
        `但是${p}非常聪明，成功完成了"${plot}"的任务。`,
        `最后，${end}`
        ];

        stories.push({
        id: `story_gen_${i}_${Date.now()}`,
        title,
        cover: ['🏰', '🌲', '🚀', '🌊', '🎪'][Math.floor(Math.random() * 5)],
        summary,
        pages,
        tags: ['冒险', '友谊']
        });
    }
  }
  
  return stories;
};

// --- 复用 Logic 辅助函数 (必须包含在文件中) ---
function generatePattern(age: number): LogicGameLevel {
  const emojis = ['🍎', '🍌', '🍇', '🐶', '🐱', '🚗', '⭐️', '❤️', '🔷', '🔶'];
  const a = emojis[Math.floor(Math.random() * emojis.length)];
  let b = emojis[Math.floor(Math.random() * emojis.length)];
  while(a === b) b = emojis[Math.floor(Math.random() * emojis.length)];
  let question = "", answer = "", options = [a, b, emojis[Math.floor(Math.random() * emojis.length)]];
  if (age <= 3) { question = `找规律：${a} ${b} ${a} ${b} ❓`; answer = a; } 
  else if (age <= 4) { question = `找规律：${a} ${a} ${b} ${a} ${a} ${b} ❓`; answer = a; } 
  else { const c = emojis[Math.floor(Math.random() * emojis.length)]; question = `找规律：${a} ${b} ${c} ${a} ${b} ${c} ❓`; answer = a; options = [a, b, c]; }
  return { type: 'pattern', question, options: shuffle(options), answer, id: '' };
}

function generateCount(age: number): LogicGameLevel {
  const max = age <= 3 ? 5 : 10;
  const target = Math.floor(Math.random() * max) + 1;
  const emojis = ['🐱', '🐶', '🍎', '⭐️', '🎈', '🍬'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];
  const questionStr = Array(target).fill(emoji).join(' ');
  const options = [target.toString(), (target + 1).toString(), (Math.max(1, target - 1)).toString()];
  return { type: 'count', question: `数一数：这里有几个 ${emoji}？\n${questionStr}`, options: shuffle(options), answer: target.toString(), id: '' };
}

function generateMath(age: number): LogicGameLevel {
  const isAddition = Math.random() > 0.3 || age < 6; 
  let a, b, result, operator;
  if (isAddition) { const max = age <= 5 ? 5 : 10; a = Math.floor(Math.random() * max) + 1; b = Math.floor(Math.random() * max) + 1; result = a + b; operator = '+'; } 
  else { a = Math.floor(Math.random() * 10) + 2; b = Math.floor(Math.random() * (a - 1)) + 1; result = a - b; operator = '-'; }
  const options = [result.toString(), (result + 1).toString(), (Math.max(0, result - 1)).toString()];
  return { type: 'math', question: `算一算：${a} ${operator} ${b} = ❓`, options: shuffle(options), answer: result.toString(), id: '' };
}

function generateCompare(age: number): LogicGameLevel {
  const max = age <= 4 ? 10 : 20;
  let a = Math.floor(Math.random() * max), b = Math.floor(Math.random() * max);
  while (a === b) b = Math.floor(Math.random() * max);
  const isGreater = a > b;
  return { type: 'compare', question: `比一比：${a} 和 ${b}，哪个更大？`, options: [a.toString(), b.toString()], answer: isGreater ? a.toString() : b.toString(), id: '' };
}

export const generateLogicLevels = (count: number = 50, age: number = 4, category?: LogicCategory): LogicGameLevel[] => {
  const levels: LogicGameLevel[] = [];
  const allTypes: LogicCategory[] = ['pattern', 'count', 'math', 'compare'];
  const targetTypes = category ? [category] : allTypes;

  for (let i = 0; i < count; i++) {
    const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    let level: LogicGameLevel;

    switch (type) {
      case 'pattern':
        level = generatePattern(age);
        break;
      case 'count':
        level = generateCount(age);
        break;
      case 'math':
        level = generateMath(age);
        break;
      case 'compare':
        level = generateCompare(age);
        break;
      default:
        level = generatePattern(age);
    }

    levels.push({
      ...level,
      id: `logic_${i}_${Date.now()}`
    });
  }
  return levels;
};
