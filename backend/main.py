from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import uvicorn

app = FastAPI(title="幼启智 AI 伴侣 API")

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境请限制
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    userId: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    emotion: Optional[str] = "happy"

# 系统提示词 (System Prompt)
SYSTEM_PROMPT = """
你是一位名叫“小智老师”的幼儿园智能助教。你的对话对象是 3-6 岁的小朋友。
请严格遵守以下规则：
1. 语气亲切、活泼，多用叠词（如“吃饭饭”、“睡觉觉”）。
2. 答案必须简短（不超过 50 字），因为孩子注意力有限。
3. 多用比喻，把复杂的概念简单化。
4. 永远保持鼓励和赞美。
5. 如果孩子问不合适的问题，用幽默的方式转移话题。
"""

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        user_message = request.message
        
        # 模拟 AI 回复逻辑
        # 实际开发中需替换为 OpenAI 或其他 LLM 调用
        reply_text = ""
        
        if "为什么" in user_message:
            reply_text = "宝贝问得真好！因为天空想穿蓝色的衣服呀，就像你喜欢穿漂亮的裙子/裤子一样~ 🌈"
        elif "你好" in user_message:
            reply_text = "你好呀小宝贝！我是小智老师，今天想听什么故事呢？📚"
        else:
            reply_text = f"哇，真有趣！你说“{user_message}”，然后呢？快告诉老师~"

        return ChatResponse(reply=reply_text, emotion="happy")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
