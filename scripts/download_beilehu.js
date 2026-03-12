const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 目标目录
const AUDIO_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/audio');
// 元数据保存路径
const METADATA_PATH = path.join(__dirname, '../youqizhi-app/frontend/src/data/beilehu_songs.json');

// 确保目录存在
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// 通用请求函数
function request(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
                'Referer': 'http://music.163.com/',
                'Cookie': 'os=pc'
            }
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
    });
}

// 1. 搜索“贝乐虎儿歌”获取 Artist ID
async function searchArtist(keyword) {
    console.log(`🔍 正在搜索艺术家: ${keyword}...`);
    // type=100 表示歌手
    const url = `http://music.163.com/api/search/get/web?s=${encodeURIComponent(keyword)}&type=100&offset=0&total=true&limit=1`;
    const data = await request(url);
    if (data.result && data.result.artists && data.result.artists.length > 0) {
        const artist = data.result.artists[0];
        console.log(`✅ 找到艺术家: ${artist.name} (ID: ${artist.id})`);
        return artist.id;
    }
    throw new Error('未找到艺术家');
}

// 2. 获取艺术家的热门歌曲
async function getArtistTopSongs(artistId) {
    console.log(`🔍 正在获取热门歌曲列表...`);
    const url = `http://music.163.com/api/artist/top/song?id=${artistId}`;
    const data = await request(url);
    if (data.songs && data.songs.length > 0) {
        console.log(`✅ 获取到 ${data.songs.length} 首热门歌曲`);
        return data.songs;
    }
    throw new Error('未获取到歌曲');
}

// 3. 下载文件
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
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
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

// 4. 获取歌词 (可选，为了更好的体验)
async function getLyric(songId) {
    const url = `http://music.163.com/api/song/lyric?id=${songId}&lv=1&kv=1&tv=-1`;
    try {
        const data = await request(url);
        if (data.lrc && data.lrc.lyric) {
            // [升级] 保留 LRC 原始时间轴格式，以便前端精确解析
            // 过滤掉无关元数据
            return data.lrc.lyric.split('\n')
                .filter(line => line.length > 0 && !line.includes('作词') && !line.includes('作曲') && !line.includes('编曲') && line.includes(']'));
        }
    } catch (e) {
        // 忽略歌词获取错误
    }
    return ["[00:00.00] (暂无歌词)"];
}

// 艺术家列表
const ARTISTS = [
    { name: "贝乐虎儿歌", icon: "🐯" },
    { name: "宝宝巴士", icon: "🚌" },
    { name: "儿歌多多", icon: "👶" }
];

async function main() {
    try {
        const allSongs = [];
        const seenSongNames = new Set(); // 用于去重，避免不同歌手唱同一首歌

        console.log("========================================");
        console.log("🎵  儿歌批量下载助手 (多歌手版)");
        console.log("========================================");

        for (const artistInfo of ARTISTS) {
            try {
                console.log(`\n🎤 处理歌手: ${artistInfo.name}`);
                
                // 1. 获取歌手 ID
                const artistId = await searchArtist(artistInfo.name);
                
                // 2. 获取热门歌曲
                const songs = await getArtistTopSongs(artistId);
                
                // 3. 遍历下载 (每位歌手取前 40 首，合计 120 首)
                const limit = 40;
                console.log(`🚀 准备下载前 ${limit} 首...`);
                
                let count = 0;
                for (let i = 0; i < songs.length && count < limit; i++) {
                    const song = songs[i];
                    
                    // 去重检查
                    if (seenSongNames.has(song.name)) {
                        // process.stdout.write(`⏭️  [跳过重复] ${song.name}\n`);
                        continue;
                    }
                    seenSongNames.add(song.name);
                    count++;

                    const safeName = song.name.replace(/[\\/:*?"<>|]/g, '_');
                    // 为了避免文件名冲突，加上歌手前缀
                    // const fileName = `${artistInfo.name}_${safeName}.mp3`; 
                    // 保持文件名简洁，如果有同名歌曲（去重逻辑已处理），直接使用歌名
                    const fileName = `${safeName}.mp3`;
                    const filePath = path.join(AUDIO_DIR, fileName);
                    const downloadUrl = `http://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
                    
                    process.stdout.write(`[${count}/${limit}] ${song.name} ... `);
                    
                    try {
                        // 下载音频
                        if (!fs.existsSync(filePath)) {
                            await downloadFile(downloadUrl, filePath);
                            process.stdout.write(`⬇️ 下载完成 `);
                        } else {
                            process.stdout.write(`⏭️ 已存在 `);
                        }
                        
                        // 获取歌词
                        const lyrics = await getLyric(song.id);
                        
                        allSongs.push({
                            t: song.name,
                            a: artistInfo.name,
                            lines: lyrics.length > 0 ? lyrics : ["[00:00.00] (暂无歌词)"],
                            icon: artistInfo.icon,
                            audio: `/audio/${fileName}`,
                            cover: song.album && song.album.picUrl ? song.album.picUrl : null // 抓取封面图
                        });
                        
                        process.stdout.write(`✅\n`);
                        
                        // 礼貌延时
                        await new Promise(r => setTimeout(r, 300));
                        
                    } catch (e) {
                        console.log(`❌ 失败: ${e.message}`);
                    }
                }
            } catch (err) {
                console.error(`❌ 处理歌手 ${artistInfo.name} 失败: ${err.message}`);
            }
        }
        
        // 4. 保存元数据文件
        fs.writeFileSync(METADATA_PATH, JSON.stringify(allSongs, null, 2));
        console.log(`\n💾 歌曲元数据已保存至: ${METADATA_PATH}`);
        console.log(`🎉 全部任务完成！共收集 ${allSongs.length} 首高品质儿歌。`);
        
    } catch (error) {
        console.error("❌ 发生错误:", error.message);
    }
}

main();
