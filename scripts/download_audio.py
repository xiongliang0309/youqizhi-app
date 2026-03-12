import os
import sys
import subprocess
import shutil

# --- 1. 尝试使用 Python 3 标准库 ---
try:
    from urllib.request import urlretrieve
    import urllib.parse
except ImportError:
    pass # 稍后处理

# 目标目录
# 修正路径以确保指向 youqizhi-app/frontend/public/audio
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_PUBLIC_DIR = os.path.join(PROJECT_ROOT, 'youqizhi-app', 'frontend', 'public', 'audio')

# 示例音频源 (这里使用一个公开的测试音频作为示例，因为在没有 yt-dlp 的情况下无法直接爬取 YouTube)
# 实际生产中，建议您手动下载 MP3 文件放入 public/audio 目录
DEMO_AUDIO_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

SONGS = [
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
]

def check_environment():
    """检查环境依赖"""
    print("🔍 正在检查环境...")
    
    # 1. 检查 Python 版本
    print(f"   Python 版本: {sys.version.split()[0]}")
    
    # 2. 检查 yt-dlp
    has_ytdlp = False
    try:
        import yt_dlp
        has_ytdlp = True
        print("   ✅ yt-dlp: 已安装")
    except ImportError:
        print("   ❌ yt-dlp: 未安装 (无法自动爬取网络音频)")
        
    # 3. 检查 ffmpeg
    has_ffmpeg = shutil.which('ffmpeg') is not None
    if has_ffmpeg:
        print("   ✅ ffmpeg: 已安装")
    else:
        print("   ❌ ffmpeg: 未安装 (无法进行格式转换)")
        
    return has_ytdlp, has_ffmpeg

def download_demo_audio(song_name, target_dir):
    """
    当环境不满足时，下载一个示例音频作为占位符
    """
    print(f"⚠️  环境受限，正在为 [{song_name}] 下载示例音频...")
    target_path = os.path.join(target_dir, f"{song_name}.mp3")
    
    try:
        # 使用 curl (macOS/Linux 通常都有)
        subprocess.run(
            ['curl', '-L', '-o', target_path, DEMO_AUDIO_URL], 
            check=True, 
            capture_output=True
        )
        print(f"✅ [示例] {song_name} 下载成功 (内容为测试音频)")
        return True
    except Exception as e:
        print(f"❌ 下载失败: {e}")
        return False

def download_real_audio(song_name, target_dir):
    """
    使用 yt-dlp 下载真实音频
    """
    import yt_dlp
    
    print(f"🔍 正在搜索下载: {song_name} ...")
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(target_dir, f'{song_name}.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'default_search': 'ytsearch1',
        'noplaylist': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"{song_name} 儿歌"])
        print(f"✅ [成功] {song_name}")
        return True
    except Exception as e:
        print(f"❌ [失败] {song_name}: {e}")
        return False

def main():
    print("="*50)
    print("🎵 儿歌音频下载助手")
    print("="*50)
    
    # 0. 确保目录存在
    if not os.path.exists(FRONTEND_PUBLIC_DIR):
        os.makedirs(FRONTEND_PUBLIC_DIR)
        print(f"📁 创建目录: {FRONTEND_PUBLIC_DIR}")
        
    # 1. 检查环境
    has_ytdlp, has_ffmpeg = check_environment()
    
    # 2. 决定下载策略
    use_crawler = has_ytdlp and has_ffmpeg
    
    if not use_crawler:
        print("\n⚠️  [注意] 由于缺少 yt-dlp 或 ffmpeg，脚本将仅下载【示例音频】用于测试。")
        print("   如需下载真实儿歌，请先解决环境报错 (通常是 xcrun 错误，需运行 `xcode-select --install`)。")
        print("-" * 50)
    else:
        print("\n✅ 环境完整，准备开始爬取真实音频...")
        print("-" * 50)

    # 3. 执行下载
    for song in SONGS:
        file_path = os.path.join(FRONTEND_PUBLIC_DIR, f"{song}.mp3")
        if os.path.exists(file_path):
            print(f"⏭️  [跳过] {song} (文件已存在)")
            continue
            
        if use_crawler:
            success = download_real_audio(song, FRONTEND_PUBLIC_DIR)
            if success:
                time.sleep(2)
        else:
            download_demo_audio(song, FRONTEND_PUBLIC_DIR)
            
    print("\n🎉 全部处理完成！")
    print(f"📂 音频文件位置: {FRONTEND_PUBLIC_DIR}")

if __name__ == "__main__":
    main()
