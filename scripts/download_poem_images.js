const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 目标目录
const IMAGE_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/images/poems');
const DATA_FILE = path.join(__dirname, '../youqizhi-app/frontend/src/data/tang_poems_100.json');

// 确保目录存在
if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// 通用下载函数
function downloadFile(url, dest) {
    if (!url) return Promise.reject(new Error('URL 为空'));
    
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

// 从 Unsplash 搜索图片 (模拟 API)
// 由于 Unsplash 需要 Key，我们这里使用 Source URL 方式
// https://source.unsplash.com/1600x900/?keyword
// 注意：source.unsplash.com 已废弃，改用 images.unsplash.com 的搜索结果或直接使用一批高质量的古风/风景图库
// 为了稳定性，这里我们预定义一组高质量的中国风/水墨/自然风景图片 URL 轮播使用
const POEM_IMAGES = [
    "https://images.unsplash.com/photo-1528164344705-4754268798dd?w=800&q=80", // 虫/自然
    "https://images.unsplash.com/photo-1518022525094-218670c9b74b?w=800&q=80", // 水墨山水感
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80", // 雾气森林
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80", // 群山
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", // 海边
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80", // 瀑布/水
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", // 草地
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", // 森林阳光
    "https://images.unsplash.com/photo-1497436072909-60f360e1d4b0?w=800&q=80", // 晨光
    "https://images.unsplash.com/photo-1501854140884-074bf6b24363?w=800&q=80", // 海滩
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&q=80", // 红色跑车(误) -> 改为红花
    "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&q=80", // 深山
    "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80", // 樱花
    "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80", // 瀑布
    "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80", // 晨雾
    "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&q=80", // 晨光海滩
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80", // 森林
    "https://images.unsplash.com/photo-1426604966848-d3ad92f58aa9?w=800&q=80", // 雪山
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80", // 星空
    "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=800&q=80"  // 日出
];

async function main() {
    console.log("========================================");
    console.log("🖼️  古诗配图下载助手");
    console.log("========================================");

    const poems = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const updatedPoems = [];

    for (let i = 0; i < poems.length; i++) {
        const poem = poems[i];
        const safeTitle = poem.title.replace(/[\\/:*?"<>|]/g, '_');
        const fileName = `${safeTitle}.jpg`;
        const filePath = path.join(IMAGE_DIR, fileName);
        
        console.log(`\n处理: ${poem.title} - ${poem.author}`);

        try {
            // 检查是否存在
            if (!fs.existsSync(filePath)) {
                // 根据索引或关键词选择图片 (这里简单轮播，保证美观)
                // 实际可以根据 poem.keywords 去搜，但为了稳定性我们用精选库
                const imgUrl = POEM_IMAGES[i % POEM_IMAGES.length];
                
                process.stdout.write(`    ⬇️  下载图片... `);
                await downloadFile(imgUrl, filePath);
                process.stdout.write(`✅\n`);
            } else {
                process.stdout.write(`    ⏭️  图片已存在\n`);
            }

            // 更新元数据
            updatedPoems.push({
                ...poem,
                image: `/images/poems/${fileName}` // 注入本地路径
            });

        } catch (err) {
            console.error(`    ❌ 失败: ${err.message}`);
            // 失败也保留原数据
            updatedPoems.push(poem);
        }
        
        // 延时
        await new Promise(r => setTimeout(r, 200));
    }

    // 回写 JSON
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedPoems, null, 2));
    console.log(`\n💾 元数据已更新，增加了 image 字段: ${DATA_FILE}`);
}

main();
