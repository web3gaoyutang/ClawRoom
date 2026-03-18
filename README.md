# ClawRoom

线下活动像素风动态签到大屏系统。每位参与者签到后，大屏上会生成一个独特的像素小人，在主题房间内自由走动，让签到变成一场视觉体验。

## 特性

- 实时签到：通过 API 接收签到事件，WebSocket 实时推送到大屏
- 像素角色：每位签到者自动生成独特的像素风角色
- 入场动画：新角色通过入口进入房间，头顶显示昵称
- 动态场景：角色在主题房间内随机移动、停留、互动
- 大屏适配：支持 1080P / 4K，适配各类横屏显示设备
- 200+ 并发：支持 200 个以上角色同时展示

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + PixiJS + Vite |
| 后端 | Python 3.11.5 + FastAPI + SQLAlchemy |
| 实时通信 | WebSocket |
| 数据库 | SQLite (MVP) |
| 包管理 | Poetry (后端) / pnpm (前端) |

## 快速开始

### 环境要求

- Python 3.11.5
- Node.js >= 18
- pnpm >= 8
- Poetry >= 1.7

### 后端启动

```bash
cd backend
poetry install
poetry run uvicorn app.main:app --reload --port 8000
```

### 前端启动

```bash
cd frontend
pnpm install
pnpm dev
```

打开浏览器访问 `http://localhost:5173` 查看大屏效果。

### 测试签到

```bash
# 发送一条签到请求
curl -X POST http://localhost:8000/api/v1/checkin \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "nickname": "张三"}'
```

## 项目结构

```
ClawRoom/
├── doc/                # 产品与技术文档
├── backend/            # Python 后端 (FastAPI)
│   ├── app/
│   │   ├── main.py     # 应用入口
│   │   ├── api/        # API 路由
│   │   ├── models/     # 数据库模型
│   │   ├── schemas/    # 数据模式
│   │   └── services/   # 业务逻辑
│   └── tests/          # 测试
└── frontend/           # React 前端
    ├── src/
    │   ├── components/ # UI 组件
    │   ├── game/       # 游戏逻辑 (PixiJS)
    │   ├── hooks/      # React Hooks
    │   └── types/      # TypeScript 类型
    └── public/assets/  # 像素资源
```

## API 文档

启动后端后访问 `http://localhost:8000/docs` 查看 Swagger 文档。

### 核心接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/checkin | 提交签到 |
| GET | /api/v1/checkins | 获取签到列表 |
| GET | /api/v1/checkins/count | 获取签到总数 |
| WS | /ws/screen | 大屏 WebSocket 连接 |

## 开发

```bash
# 后端测试
cd backend && poetry run pytest

# 前端测试
cd frontend && pnpm test

# 前端构建
cd frontend && pnpm build
```

## 许可证

MIT
