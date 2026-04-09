import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import fetch, { Headers, Request, Response } from 'cross-fetch'
import { createClient } from '@supabase/supabase-js'

if (!globalThis.fetch) {
  globalThis.fetch = fetch
  globalThis.Headers = Headers
  globalThis.Request = Request
  globalThis.Response = Response
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'media'

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  global: { fetch },
})

const JOBS = [
  { q: '主持人', a: '在舞台或电视上主持节目，带动气氛，让节目更有趣。', icon: '/images/jobs/主持人.png' },
  { q: '交通警察', a: '站在路口指挥车辆和行人，让马路更安全、不堵车，保障出行顺畅。', icon: '/images/jobs/交通警察.png' },
  { q: '作家', a: '用文字写故事、童话，创作好看的书籍。', icon: '/images/jobs/作家.png' },
  { q: '健身教练', a: '教大家科学锻炼身体，让身体更强壮。', icon: '/images/jobs/健身教练.png' },
  { q: '兽医', a: '专门给小动物看病、打针，守护宠物健康。', icon: '/images/jobs/兽医.png' },
  { q: '农民', a: '在田里种粮食、蔬菜、水果，让我们有饭吃。', icon: '/images/jobs/农民.png' },
  { q: '列车员', a: '在火车或高铁上为大家检票、指路，照顾乘客。', icon: '/images/jobs/列车员.png' },
  { q: '化妆师', a: '在婚礼、舞台上帮人化妆，让人变得更漂亮。', icon: '/images/jobs/化妆师.png' },
  { q: '医生', a: '在医院穿着白大褂，用听诊器为病人检查身体，帮助大家赶走病痛、恢复健康。', icon: '/images/jobs/医生.png' },
  { q: '厨师', a: '在厨房里切菜、炒菜、炖汤，做出香喷喷的饭菜给大家吃。', icon: '/images/jobs/厨师.png' },
  { q: '图书管理员', a: '在图书馆整理书籍，帮小朋友找书，维持安静的阅读环境。', icon: '/images/jobs/图书管理员.png' },
  { q: '外卖员', a: '穿梭在城市里，把热乎的饭菜快速送到大家家里。', icon: '/images/jobs/外卖员.png' },
  { q: '宇航员', a: '穿着宇航服坐火箭飞向太空，探索星球。', icon: '/images/jobs/宇航员.png' },
  { q: '宠物美容师', a: '帮宠物洗澡、剪毛，让小动物干净又可爱。', icon: '/images/jobs/宠物美容师.png' },
  { q: '工程师', a: '根据图纸设计、建造桥梁、机器和各种设施。', icon: '/images/jobs/工程师.png' },
  { q: '幼儿园老师', a: '照顾小朋友，带大家唱歌、画画、做游戏，守护快乐童年。', icon: '/images/jobs/幼儿园老师.png' },
  { q: '建筑工人', a: '戴着安全帽盖房子、修马路，建设美丽城市。', icon: '/images/jobs/建筑工人.png' },
  { q: '建筑师', a: '画出房子、桥梁的设计图，规划城市建筑。', icon: '/images/jobs/建筑师.png' },
  { q: '快递员', a: '风雨无阻送包裹，把大家网购的东西送到家门口。', icon: '/images/jobs/快递员.png' },
  { q: '护士', a: '在病房为病人量体温、打针、换药，细心照顾生病的人，协助医生治疗。', icon: '/images/jobs/护士.png' },
  { q: '摄影师', a: '用相机拍下风景、人物，留住生活中美好的瞬间。', icon: '/images/jobs/摄影师.png' },
  { q: '收银员', a: '在超市或商店扫码算账，帮大家完成购物付钱。', icon: '/images/jobs/收银员.png' },
  { q: '救生员', a: '在泳池或海边看守，时刻注意安全，及时救助遇到危险的人。', icon: '/images/jobs/救生员.png' },
  { q: '教师', a: '站在教室里教小朋友知识、讲道理，陪伴大家学习成长。', icon: '/images/jobs/教师.png' },
  { q: '月嫂', a: '专业照顾小宝宝和刚生完宝宝的妈妈。', icon: '/images/jobs/月嫂.png' },
  { q: '服务员', a: '在餐厅端菜、收拾桌子，热情招待来吃饭的客人。', icon: '/images/jobs/服务员.png' },
  { q: '木匠', a: '用木头制作桌子、椅子、柜子等家具。', icon: '/images/jobs/木匠.png' },
  { q: '气象预报员', a: '分析天气数据，告诉大家明天是晴是雨。', icon: '/images/jobs/气象预报员.png' },
  { q: '水管工', a: '修水管、通马桶，解决家里用水的小麻烦。', icon: '/images/jobs/水管工.png' },
  { q: '汽修工', a: '检查修理故障汽车，让车子能正常行驶。', icon: '/images/jobs/汽修工.png' },
  { q: '消防员', a: '开着消防车赶到火灾现场，灭火、救人、处理危险，守护大家的生命安全。', icon: '/images/jobs/消防员.png' },
  { q: '演员', a: '在电视、电影里扮演角色，表演精彩的故事。', icon: '/images/jobs/演员.png' },
  { q: '漫画家', a: '画出有趣的漫画人物和故事，带给大家欢乐。', icon: '/images/jobs/漫画家.png' },
  { q: '牙医', a: '帮小朋友检查牙齿、治蛀牙，教大家保护牙齿。', icon: '/images/jobs/牙医.png' },
  { q: '环卫工人', a: '穿着黄马甲清扫马路、清理垃圾，让城市每天都干干净净。', icon: '/images/jobs/环卫工人.png' },
  { q: '理发师', a: '用剪刀和梳子为大家修剪头发，让人变得干净又精神。', icon: '/images/jobs/理发师.png' },
  { q: '电工', a: '安装和修理电线、电灯，保证家里有电可用。', icon: '/images/jobs/电工.png' },
  { q: '画家', a: '拿着画笔和颜料，画出美丽的风景、动物和有趣的图画。', icon: '/images/jobs/画家.png' },
  { q: '科学家', a: '在实验室做实验，探索大自然和宇宙的秘密。', icon: '/images/jobs/科学家.png' },
  { q: '程序员', a: '用电脑写代码，制作软件、游戏和手机 APP。', icon: '/images/jobs/程序员.png' },
  { q: '花艺师', a: '用鲜花制作漂亮花束，装点生活，让环境更美。', icon: '/images/jobs/花艺师.png' },
  { q: '警察', a: '身穿警服在社区巡逻，维护秩序，保护大家安全，主动帮助有困难的人。', icon: '/images/jobs/警察.png' },
  { q: '邮递员', a: '骑着小车挨家挨户送信、送包裹，把信件和礼物送到大家手中。', icon: '/images/jobs/邮递员.png' },
  { q: '配音演员', a: '用好听的声音给动画片角色配音，让角色活起来。', icon: '/images/jobs/配音演员.png' },
  { q: '面点师', a: '揉面、烘烤，制作面包、蛋糕、饼干等甜甜的点心。', icon: '/images/jobs/面点师.png' },
  { q: '音乐家', a: '弹奏乐器，演奏好听的音乐，给大家带来快乐。', icon: '/images/jobs/音乐家.png' },
  { q: '飞行员', a: '驾驶飞机在天上飞，安全把乘客送到各个地方。', icon: '/images/jobs/飞行员.png' },
  { q: '饲养员', a: '在动物园或农场喂小动物吃饭、打扫卫生，照顾它们健康成长。', icon: '/images/jobs/饲养员.png' },
  { q: '验光师', a: '用仪器检查视力，帮大家配到合适的眼镜。', icon: '/images/jobs/验光师.png' }
]

async function ensureBucket() {
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw error

  const exists = (buckets || []).some((b) => b.name === SUPABASE_BUCKET)
  if (exists) return

  const { error: createError } = await supabase.storage.createBucket(SUPABASE_BUCKET, {
    public: true,
  })
  if (createError) throw createError
}

async function migrateJobs() {
  console.log('Migrating jobs...')
  await ensureBucket()

  // First, clear existing job entries in science_questions to avoid duplicates
  await supabase.from('science_questions').delete().eq('category', 'job')

  const formattedJobs = []

  let idx = 0
  for (const job of JOBS) {
    idx++
    let imageUrl = ''
    if (job.icon) {
      const localPath = path.join(process.cwd(), 'public', job.icon.replace(/^\//, ''))
      if (fs.existsSync(localPath)) {
        const storagePath = `images/jobs/job_${idx}.png`
        const fileBuffer = fs.readFileSync(localPath)

        console.log(`Uploading ${storagePath}...`)
        const { error: uploadError } = await supabase.storage.from(SUPABASE_BUCKET).upload(storagePath, fileBuffer, {
          upsert: true,
          contentType: 'image/png',
          cacheControl: '31536000',
        })

        if (uploadError) {
          console.error(`Error uploading ${job.icon}:`, uploadError.message)
        }
        const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(storagePath)
        imageUrl = urlData?.publicUrl || ''
      } else {
        console.warn(`Local image not found: ${localPath}`)
      }
    }

    formattedJobs.push({
      category: 'job',
      subcategory: 'job',
      question: job.q,
      answer: job.a,
      action: imageUrl, // Storing image URL in the action column
    })
  }

  for (let i = 0; i < formattedJobs.length; i += 50) {
    const batch = formattedJobs.slice(i, i + 50)
    const { error } = await supabase.from('science_questions').insert(batch)
    if (error) {
      console.error('Error inserting jobs batch:', error)
      continue
    }
    console.log(`Inserted jobs ${i} to ${i + batch.length}`)
  }

  console.log('Jobs migration completed.')
}

migrateJobs().catch(err => {
  console.error(err)
  process.exit(1)
})
