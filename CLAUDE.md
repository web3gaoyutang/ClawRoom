# CLAUDE.md - ClawRoom 项目指引

## 项目概述

ClawRoom 是一个线下活动像素风动态签到大屏系统。后端使用 Python + FastAPI，前端使用 React + PixiJS。

## 技术栈

- **后端**: Python 3.11.5, FastAPI, SQLAlchemy 2.0, aiosqlite
- **前端**: React 18, TypeScript, PixiJS, Vite
- **包管理**: Poetry (后端), pnpm (前端)
- **数据库**: SQLite (MVP), 后续可切换 PostgreSQL
- **实时通信**: WebSocket

## 项目结构

- `backend/` - Python 后端，使用 Poetry 管理依赖
- `frontend/` - React 前端，使用 pnpm 管理依赖
- `doc/` - 产品文档和技术文档

## 常用命令

```bash
# 后端
cd backend && poetry install                          # 安装依赖
cd backend && poetry run uvicorn app.main:app --reload # 启动开发服务器
cd backend && poetry run pytest                        # 运行测试
cd backend && poetry run alembic upgrade head           # 数据库迁移

# 前端
cd frontend && pnpm install   # 安装依赖
cd frontend && pnpm dev       # 启动开发服务器
cd frontend && pnpm test      # 运行测试
cd frontend && pnpm build     # 构建生产版本
```

## 开发规范

### 后端
- 使用 async/await 异步编程
- API 路由放在 `app/api/` 目录
- 数据库模型放在 `app/models/` 目录
- Pydantic 模式放在 `app/schemas/` 目录
- 业务逻辑放在 `app/services/` 目录
- 数据库迁移使用 Alembic
- 测试使用 pytest + pytest-asyncio + httpx

### 前端
- 使用 TypeScript 严格模式
- UI 组件放在 `src/components/`
- 游戏逻辑（PixiJS）放在 `src/game/`
- WebSocket 等 hooks 放在 `src/hooks/`
- 类型定义放在 `src/types/`

### API 设计
- REST API 前缀: `/api/v1/`
- WebSocket 端点: `/ws/screen`
- 请求/响应使用 JSON 格式

## 注意事项

- 前端游戏层使用 PixiJS 渲染，React 只管理 UI 层
- WebSocket 需要处理重连逻辑（指数退避）
- 角色生成基于 user_id 哈希，保证同一用户角色一致
- 签到接口需要去重处理（基于 user_id）
- 大屏需适配 1080P 和 4K 分辨率
