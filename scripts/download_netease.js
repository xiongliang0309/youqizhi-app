const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 目标目录
const AUDIO_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/audio');

// 儿歌列表
const SONGS = [
    "小兔子乖乖",
    "两只老虎",
    "数鸭子",
    "拔萝卜",
    "小毛驴",
    "一分钱",
    "找朋友",
    "丢手绢",
    "上学歌",
    "我的好妈妈"
];

// 确保目录存在
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/**
 * 搜索歌曲获取 ID
 * 使用网易云音乐公开搜索接口
 */
function searchSong(keyword) {
    return new Promise((resolve, reject) => {
        const searchUrl = `http://music.163.com/api/search/get/web?s=${encodeURIComponent(keyword + ' 儿歌')}&type=1&offset=0&total=true&limit=1`;
        
        http.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'Referer': 'http://music.163.com/'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.result && result.result.songs && result.result.songs.length > 0) {
                        const song = result.result.songs[0];
                        resolve({
                            id: song.id,
                            name: song.name,
                            artist: song.artists[0].name
                        });
                    } else {
                        reject(new Error('未找到相关歌曲'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

/**
 * 下载文件
 */
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        // 网易云外链是 http，但可能会重定向到 https
        const protocol = url.startsWith('https') ? https : http;
        
        protocol.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // 处理重定向
                downloadFile(res.headers.location, dest).then(resolve).catch(reject);
                return;
            }

            if (res.statusCode !== 200) {
                reject(new Error(`下载失败: 状态码 ${res.statusCode}`));
                return;
            }

            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
            file.on('error', (err) => {
                fs.unlink(dest, () => {}); // 删除未完成的文件
                reject(err);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

/**
 * 主函数
 */
async function main() {
    console.log("========================================");
    console.log("🎵  网易云音乐下载助手 (Node.js版)");
    console.log("========================================");
    console.log(`📂  保存目录: ${AUDIO_DIR}\n`);

    for (const songName of SONGS) {
        const filePath = path.join(AUDIO_DIR, `${songName}.mp3`);
        
        // 即使文件存在也覆盖，因为之前下载的是错误的演示音频
        // if (fs.existsSync(filePath)) { ... } 
        
        process.stdout.write(`🔍  搜索: ${songName} ... `);
        
        try {
            // 1. 搜索
            const songInfo = await searchSong(songName);
            process.stdout.write(`✅ 找到: ${songInfo.name} (${songInfo.artist}) [ID:${songInfo.id}]\n`);
            
            // 2. 构造下载链接
            // 网易云音乐官方外链接口
            const downloadUrl = `http://music.163.com/song/media/outer/url?id=${songInfo.id}.mp3`;
            
            // 3. 下载
            process.stdout.write(`    ⬇️  正在下载... `);
            await downloadFile(downloadUrl, filePath);
            console.log(`✅ 完成`);
            
            // 礼貌延时
            await new Promise(r => setTimeout(r, 1000));
            
        } catch (error) {
            console.log(`❌ 失败: ${error.message}`);
        }
    }
    
    console.log("\n🎉  全部任务结束！");
}

main();
