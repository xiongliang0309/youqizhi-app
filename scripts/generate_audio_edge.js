const fs = require('fs');
const path = require('path');
// 引用前端目录下的 node_modules
const { EdgeTTS } = require('../youqizhi-app/frontend/node_modules/node-edge-tts');

// 目标目录
const AUDIO_DIR = path.join(__dirname, '../youqizhi-app/frontend/public/audio/poems');
const DATA_FILE = path.join(__dirname, '../youqizhi-app/frontend/src/data/tang_poems_100.json');

// 确保目录存在
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

async function main() {
    console.log("========================================");
    console.log("🎙️  古诗词音频生成助手 (Edge TTS)");
    console.log("========================================");

    const poems = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const updatedPoems = [];

    const tts = new EdgeTTS({
        voice: 'zh-CN-XiaoxiaoNeural', // 晓晓 - 温暖亲切
        lang: 'zh-CN',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        rate: '-25%' // 0.75倍速，更加舒缓，适合幼儿跟读
    });

    for (const poem of poems) {
        console.log(`\n正在生成: ${poem.title} - ${poem.author}`);
        
        // 构建朗读文本 (SSML) 以支持情感
        // 使用 "cheerful" (欢快/讲故事) 风格，配合 0.75 倍速，效果更像亲子共读
        // 注意：node-edge-tts 会自动包裹 <speak> 标签，我们只需提供内容
        // 但为了精确控制 style，我们需要构造合法的 SSML 片段
        // 尝试直接使用纯文本，因为 node-edge-tts 对 SSML 支持有限，且 rate 参数已经是全局控制了
        // 为了"深情并茂"，我们通过标点符号的停顿来增强节奏感
        const text = `
            题目：${poem.title}。
            作者：${poem.author}。
            ${poem.content.join('，')}。
        `;
        
        const fileName = `${poem.title}.mp3`;
        const filePath = path.join(AUDIO_DIR, fileName);

        try {
            // 强制重新生成，以应用新的语速设置
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            await tts.ttsPromise(text, filePath);
            console.log(`  ✅ 生成成功: ${filePath}`);
            
            // 更新元数据
            updatedPoems.push({
                ...poem,
                audio: `/audio/poems/${fileName}` // 注入本地音频路径
            });

        } catch (error) {
            console.error(`  ❌ 生成失败: ${error.message}`);
            updatedPoems.push(poem); // 失败也保留
        }
        
        // 简单延时
        await new Promise(r => setTimeout(r, 500));
    }
    
    // 回写 JSON
    fs.writeFileSync(DATA_FILE, JSON.stringify(updatedPoems, null, 2));
    console.log(`\n💾 元数据已更新，增加了 audio 字段: ${DATA_FILE}`);
}

main();
