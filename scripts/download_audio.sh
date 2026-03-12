#!/bin/bash

# 设置目标目录
TARGET_DIR="./youqizhi-app/frontend/public/audio"

# 确保目录存在
mkdir -p "$TARGET_DIR"

echo "========================================"
echo "🎵  儿歌音频下载助手 (Shell版)"
echo "========================================"
echo "⚠️  注意: 由于 Python 环境问题，此脚本将使用 curl 下载"
echo "    演示音频文件，以便您测试播放器功能。"
echo "========================================"

# 定义儿歌列表
songs=(
    "小兔子乖乖"
    "两只老虎"
    "数鸭子"
    "拔萝卜"
    "小毛驴"
    "一分钱"
    "找朋友"
    "丢手绢"
    "上学歌"
    "我的好妈妈"
)

# 演示音频 URL (这里使用一个公开的测试音频)
DEMO_URL="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

# 循环下载
for song in "${songs[@]}"; do
    file_path="$TARGET_DIR/$song.mp3"
    
    if [ -f "$file_path" ]; then
        echo "⏭️  [跳过] $song.mp3 (文件已存在)"
    else
        echo "⬇️  正在下载: $song.mp3 ..."
        # 使用 curl 下载并重命名
        if curl -L -s -o "$file_path" "$DEMO_URL"; then
            echo "✅ [成功] $song.mp3"
        else
            echo "❌ [失败] $song.mp3"
        fi
        # 避免请求过快
        sleep 1
    fi
done

echo ""
echo "🎉 全部完成！音频文件已保存至:"
echo "📂 $TARGET_DIR"
