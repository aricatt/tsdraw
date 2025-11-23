# TSDraw 项目

> 学习 tldraw 思想，为儿童打造的 AI 增强无限画布

## 📚 项目结构

```
tsdraw/
├── packages/
│   ├── editor/          # 核心编辑器（✅ 已完成基础）
│   ├── ai/              # AI 服务（待开发）
│   ├── ui/              # UI 组件（待开发）
│   └── schema/          # 数据模型（待开发）
├── apps/
│   └── demo/            # 演示应用（待开发）
└── docs/
    ├── ARCHITECTURE.md  # 架构文档（✅ 已完成）
    ├── API.md           # API 文档（待完成）
    └── MIGRATION.md     # 迁移指南（待完成）
```

## 🎯 设计原则

1. **学习思想，不复制代码** - 学习 tldraw 的设计模式，但完全自己实现
2. **使用开源库** - 直接使用 `@tldraw/state` 和 `@tldraw/store`（MIT 许可）
3. **保持兼容性** - 为未来迁移到 tldraw 做好准备
4. **专注儿童** - 针对儿童场景优化
5. **AI 增强** - 原创的 AI 功能

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

### 构建

```bash
npm run build
```

## 📦 已完成的模块

### @tsdraw/editor

核心编辑器包，提供：

- ✅ Editor 类（中心化管理）
- ✅ 响应式状态管理（基于 @tldraw/state）
- ✅ 数据存储（基于 @tldraw/store）
- ✅ 类型安全的 API
- ✅ 基础图形操作（创建、更新、删除）
- ✅ 选择操作
- ✅ 相机操作
- ⏳ 历史管理（待实现）
- ⏳ Shape 系统（待实现）
- ⏳ Tool 系统（待实现）

## 🗺️ 开发路线图

### 第 1 周（当前）
- [x] 项目架构设计
- [x] 基础类型定义
- [x] Editor 核心类
- [ ] Store Schema 定义
- [ ] 基础测试

### 第 2 周
- [ ] Shape 系统
- [ ] 渲染器（基于 react-konva）
- [ ] 基础 UI 组件

### 第 3 周
- [ ] Tool 系统
- [ ] 历史管理
- [ ] 事件处理

### 第 4-5 周
- [ ] AI 服务集成
- [ ] 语音识别
- [ ] 手绘识别

### 第 6-7 周
- [ ] 儿童友好 UI
- [ ] 动画和反馈
- [ ] 完整示例

### 第 8 周
- [ ] 性能优化
- [ ] 测试和文档
- [ ] 发布 v0.1.0

## 📖 文档

- [架构设计](./ARCHITECTURE.md) - 详细的架构说明
- [API 文档](./docs/API.md) - API 使用指南（待完成）
- [迁移指南](./docs/MIGRATION.md) - 如何迁移到 tldraw（待完成）

## ⚖️ 法律合规

### 使用的开源库

| 库 | 许可证 | 用途 |
|-----|--------|------|
| @tldraw/state | MIT | 响应式状态管理 |
| @tldraw/store | MIT | 数据存储 |
| @tldraw/utils | MIT | 工具函数 |
| react | MIT | UI 框架 |

### 自己实现的部分

- ✅ Editor 类
- ✅ 类型定义
- ⏳ Shape 系统
- ⏳ Tool 系统
- ⏳ AI 服务
- ⏳ 儿童 UI

## 🤝 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)

## 📄 许可证

MIT

## 🙏 致谢

本项目学习了 [tldraw](https://github.com/tldraw/tldraw) 的优秀设计思想，特此致谢。
