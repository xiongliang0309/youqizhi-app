const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 目标目录
const VIDEO_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/videos');
const THUMB_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/videos/thumbs');
const METADATA_PATH = path.join(__dirname, '../youqizhi-app/frontend/src/data/cartoons.json');

// 确保目录存在
[VIDEO_DIR, THUMB_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 通用下载函数
function downloadFile(url, dest) {
    if (!url) return Promise.reject(new Error('URL 为空'));
    if (url.startsWith('//')) url = 'https:' + url;
    
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                downloadFile(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Status ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', (err) => {
                fs.unlink(dest, () => {});
                reject(err);
            });
        });
        req.on('error', reject);
    });
}

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        http.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

// 模拟下载 m3u8 (实际需要 ffmpeg)
async function main() {
    console.log("========================================");
    console.log("🎬  《布鲁伊》全集爬虫 (Jututs 源)");
    console.log("========================================");

    // 目标集数 (前 52 集)
    const baseUrl = 'http://www.jututs.com/dongman/buluyidiyijiputonghuaban/1-';
    
    // 读取现有数据
    let existingData = [];
    if (fs.existsSync(METADATA_PATH)) {
        existingData = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf-8'));
    }

    const newCartoons = [];

    // 使用更稳定的封面图源 (豆瓣/B站)
    // 这里使用一张高清的布鲁伊全家福作为通用封面，避免 403
    const COVER_URL = "https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg"; // 网易云音乐图床，相对稳定
    
    // 先下载通用封面
    const commonCoverName = "bluey_cover_common.jpg";
    const commonCoverPath = path.join(THUMB_DIR, commonCoverName);
    
    try {
        if (!fs.existsSync(commonCoverPath)) {
            console.log("🖼️  下载通用封面...");
            // 备用图源: 如果网易云挂了，可以用 Unsplash 的狗
            await downloadFile(COVER_URL, commonCoverPath)
                .catch(() => downloadFile("https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&q=80", commonCoverPath));
        }
    } catch (e) {
        console.log("⚠️ 封面下载失败，将使用默认图");
    }

    for (let i = 1; i <= 52; i++) {
        const pageUrl = `${baseUrl}${i}.html`;
        process.stdout.write(`处理第 ${i}/52 集... `);
        
        try {
            const html = await fetchPage(pageUrl);
            
            // 尝试提取 m3u8 地址
            const match = html.match(/"url":"(https?:\\\/\\\/[^"]+\.m3u8)"/);
            let m3u8Url = '';
            
            if (match) {
                m3u8Url = match[1].replace(/\\/g, ''); // 去除转义符
            } else {
                // 备用正则
                const match2 = html.match(/now="([^"]+\.m3u8)"/); 
                if (match2) {
                    m3u8Url = match2[1];
                } else {
                    process.stdout.write(`❌ 无源\n`);
                    continue;
                }
            }

            // 构造元数据
            const title = `布鲁伊 第一季 第${i}集`;
            
            newCartoons.push({
                id: `bluey_jututs_${i}`,
                title: title,
                category: "bluey",
                cover: `/videos/thumbs/${commonCoverName}`, // 使用本地通用封面
                video: m3u8Url, 
                isHls: true,    
                duration: "07:00",
                author: "Bluey"
            });
            
            process.stdout.write(`✅\n`);

        } catch (err) {
            process.stdout.write(`❌ 失败\n`);
        }
        
        // 简单限流，避免封 IP
        await new Promise(r => setTimeout(r, 100));
    }

    // 更新数据
    if (newCartoons.length > 0) {
        // 保留非 bluey_jututs 的数据 (即其他动画)
        const finalData = existingData.filter(item => !item.id.includes('bluey_jututs'));
        finalData.push(...newCartoons);
        fs.writeFileSync(METADATA_PATH, JSON.stringify(finalData, null, 2));
        console.log(`\n🎉 成功添加 ${newCartoons.length} 集！数据已保存。`);
    } else {
        console.log(`\n⚠️ 没有抓取到有效数据。`);
    }
}

main();
