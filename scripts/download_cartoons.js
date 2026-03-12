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

// 示例动画数据源 (由于版权限制，我们使用一些公开的高清短片或演示视频)
// 实际生产中可以接入具体的 API 或爬虫
const CARTOONS = [
    {
        title: "小猪佩奇 - 快乐的一天",
        category: "classic",
        coverUrl: "https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg", // 临时使用网络图
        videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4", // 开源电影 Sintel 预告片 (仅作演示)
        duration: "00:52",
        author: "Peppa Pig"
    },
    {
        title: "海底小纵队 - 探险记",
        category: "science",
        coverUrl: "https://p2.music.126.net/tGHUycRcC3jobxFbfL8Jgw==/18885211718935735.jpg",
        videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", // MDN 示例视频
        duration: "01:30",
        author: "Octonauts"
    },
    {
        title: "大自然的声音 - 森林",
        category: "science",
        coverUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4", // 开源 Big Buck Bunny
        duration: "02:15",
        author: "Nature"
    },
    {
        title: "ABC 字母歌",
        category: "english",
        coverUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // W3Schools 示例
        duration: "01:00",
        author: "English Kids"
    }
];

async function main() {
    console.log("========================================");
    console.log("🎬  动画片资源下载助手");
    console.log("========================================");
    
    const processedCartoons = [];

    for (let i = 0; i < CARTOONS.length; i++) {
        const item = CARTOONS[i];
        console.log(`\n处理: ${item.title}`);

        // 1. 生成文件名
        const safeName = item.title.replace(/[\\/:*?"<>|]/g, '_');
        const videoFileName = `${safeName}.mp4`;
        const thumbFileName = `${safeName}.jpg`;
        
        const videoPath = path.join(VIDEO_DIR, videoFileName);
        const thumbPath = path.join(THUMB_DIR, thumbFileName);

        try {
            // 2. 下载视频 (如果不存在)
            if (!fs.existsSync(videoPath)) {
                process.stdout.write(`    ⬇️  下载视频... `);
                await downloadFile(item.videoUrl, videoPath);
                process.stdout.write(`✅\n`);
            } else {
                process.stdout.write(`    ⏭️  视频已存在\n`);
            }

            // 3. 下载封面 (如果不存在)
            if (!fs.existsSync(thumbPath)) {
                process.stdout.write(`    ⬇️  下载封面... `);
                await downloadFile(item.coverUrl, thumbPath);
                process.stdout.write(`✅\n`);
            } else {
                process.stdout.write(`    ⏭️  封面已存在\n`);
            }

            // 4. 添加到结果列表
            processedCartoons.push({
                id: `cartoon_${i}`,
                title: item.title,
                category: item.category, // classic, science, english
                cover: `/videos/thumbs/${thumbFileName}`,
                video: `/videos/${videoFileName}`,
                duration: item.duration,
                author: item.author
            });

        } catch (err) {
            console.error(`    ❌ 失败: ${err.message}`);
        }
    }

    // 5. 保存元数据
    fs.writeFileSync(METADATA_PATH, JSON.stringify(processedCartoons, null, 2));
    console.log(`\n💾 动画元数据已保存至: ${METADATA_PATH}`);
    console.log("🎉 全部完成！");
}

main();
