# TSDraw 架构设计文档

> **设计原则**：学习 tldraw 思想，使用开源库实现，保持架构兼容性，便于未来迁移到 tldraw

## 📋 目录

- [1. 架构概览](#1-架构概览)
- [2. 核心模块](#2-核心模块)
- [3. 技术栈](#3-技术栈)
- [4. 目录结构](#4-目录结构)
- [5. 数据模型](#5-数据模型)
- [6. 迁移策略](#6-迁移策略)

---

## 1. 架构概览

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                     │
│              儿童友好界面 + AI 交互组件                   │
├─────────────────────────────────────────────────────────┤
│                   Editor Layer                          │
│            核心编辑器 API + 工具系统                      │
├─────────────────────────────────────────────────────────┤
│                   Shape Layer                           │
│         图形系统 + 渲染器 + 碰撞检测                      │
├─────────────────────────────────────────────────────────┤
│                   State Layer                           │
│      响应式状态管理 (基于 @tldraw/state - MIT)          │
├─────────────────────────────────────────────────────────┤
│                   Store Layer                           │
│       数据存储 + 事务 (基于 @tldraw/store - MIT)         │
├─────────────────────────────────────────────────────────┤
│                   AI Layer                              │
│         语音识别 + 手绘识别 + 创意生成                    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 核心设计思想（学习自 tldraw）

1. **中心化编辑器** - 单一 Editor 类管理所有状态和操作
2. **响应式状态** - 基于 Signals 的细粒度更新
3. **事务系统** - 批量更新，支持 undo/redo
4. **插件化图形** - 每个图形类型独立的 Util 类
5. **状态机工具** - 工具是状态机节点
6. **三层状态作用域** - Document/Session/Presence 分离

---

## 2. 核心模块

### 2.1 Editor（核心编辑器）

**职责**：
- 管理画布状态
- 提供统一的 API
- 协调各个子系统

**关键 API**：
```typescript
class Editor {
  // 图形操作
  createShape(type: string, props: any): Shape
  updateShape(id: string, changes: Partial<Shape>): void
  deleteShape(id: string): void
  
  // 选择操作
  selectShape(id: string): void
  selectAll(): void
  clearSelection(): void
  
  // 历史操作
  undo(): void
  redo(): void
  
  // 事务操作
  batch(fn: () => void): void
  
  // AI 扩展
  createShapeByVoice(audio: Blob): Promise<Shape>
  recognizeDrawing(points: Point[]): Promise<Shape>
}
```

### 2.2 Store（数据存储）

**使用**：`@tldraw/store` (MIT 许可)

**职责**：
- 存储所有 Records
- 提供响应式订阅
- 支持事务和快照

**数据结构**：
```typescript
interface StoreSchema {
  shape: ShapeRecord      // 图形数据
  page: PageRecord        // 页面数据
  camera: CameraRecord    // 相机状态
  instance: InstanceRecord // 实例状态
}
```

### 2.3 State（响应式状态）

**使用**：`@tldraw/state` (MIT 许可)

**职责**：
- 提供 Signals 响应式系统
- 自动依赖追踪
- 细粒度更新

**核心概念**：
```typescript
import { atom, computed } from '@tldraw/state'

// Atom - 可变状态
const shapesAtom = atom('shapes', [])

// Computed - 派生状态
const selectedShapesAtom = computed('selectedShapes', () => {
  const shapes = shapesAtom.get()
  const selectedIds = selectedIdsAtom.get()
  return shapes.filter(s => selectedIds.includes(s.id))
})
```

### 2.4 Shape System（图形系统）

**职责**：
- 定义图形类型
- 处理渲染逻辑
- 碰撞检测
- 边界计算

**架构**：
```typescript
// 基础图形接口
interface BaseShape {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  props: Record<string, any>
}

// 图形处理器（类似 tldraw 的 ShapeUtil）
abstract class ShapeUtil<T extends BaseShape> {
  abstract type: string
  
  // 渲染
  abstract component(shape: T): React.ReactNode
  
  // 边界计算
  abstract getBounds(shape: T): Box
  
  // 碰撞检测
  abstract hitTest(shape: T, point: Point): boolean
  
  // 默认属性
  abstract getDefaultProps(): T['props']
}
```

### 2.5 Tool System（工具系统）

**职责**：
- 管理用户交互
- 状态机模式
- 工具切换

**架构**：
```typescript
// 工具基类（类似 tldraw 的 StateNode）
abstract class Tool {
  abstract id: string
  
  // 生命周期
  onEnter?(): void
  onExit?(): void
  
  // 事件处理
  onPointerDown?(e: PointerEvent): void
  onPointerMove?(e: PointerEvent): void
  onPointerUp?(e: PointerEvent): void
  onKeyDown?(e: KeyboardEvent): void
}

// 具体工具
class SelectTool extends Tool {
  id = 'select'
  
  onPointerDown(e: PointerEvent) {
    // 选择逻辑
  }
}

class DrawTool extends Tool {
  id = 'draw'
  
  onPointerDown(e: PointerEvent) {
    // 绘制逻辑
  }
}
```

### 2.6 AI System（AI 系统）

**职责**：
- 语音识别和理解
- 手绘图形识别
- 创意联想生成

**架构**：
```typescript
class AIService {
  // 语音 → 图形
  async voiceToShape(audio: Blob): Promise<Shape> {
    const text = await this.speechToText(audio)
    const intent = await this.parseIntent(text)
    return this.createShapeFromIntent(intent)
  }
  
  // 手绘 → 规范图形
  async recognizeDrawing(points: Point[]): Promise<{
    type: string
    confidence: number
    props: any
  }> {
    // 识别逻辑
  }
  
  // 内容 → 创意联想
  async generateIdeas(context: Context): Promise<Idea[]> {
    // GPT-4 生成联想
  }
}
```

---

## 3. 技术栈

### 3.1 核心依赖

| 模块 | 库 | 许可证 | 说明 |
|------|-----|--------|------|
| 状态管理 | `@tldraw/state` | MIT | tldraw 的响应式状态库 |
| 数据存储 | `@tldraw/store` | MIT | tldraw 的数据存储库 |
| 工具库 | `@tldraw/utils` | MIT | tldraw 的工具函数 |
| React | `react@19` | MIT | UI 框架 |
| TypeScript | `typescript` | Apache 2.0 | 类型系统 |

### 3.2 渲染层

| 选项 | 库 | 优势 |
|------|-----|------|
| 方案 A | `react-konva` | 声明式 API，性能好 |
| 方案 B | `fabric.js` | 功能丰富，对象模型清晰 |
| 方案 C | 原生 Canvas | 最大控制权，性能最优 |

**推荐**：先用 `react-konva`，性能不够再优化

### 3.3 AI 能力

| 功能 | 库/服务 | 说明 |
|------|---------|------|
| 语音识别 | Web Speech API | 浏览器原生 |
| 意图理解 | OpenAI GPT-4 | 商业 API |
| 图形识别 | TensorFlow.js | 本地推理 |
| 创意生成 | OpenAI GPT-4 | 商业 API |

---

## 4. 目录结构

```
tsdraw/
├── packages/
│   ├── editor/              # 核心编辑器（类似 @tldraw/editor）
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── editor/
│   │   │   │   │   ├── Editor.ts           # 核心编辑器类
│   │   │   │   │   └── types.ts
│   │   │   │   ├── shapes/
│   │   │   │   │   ├── ShapeUtil.ts        # 图形处理基类
│   │   │   │   │   ├── CircleUtil.ts
│   │   │   │   │   ├── RectUtil.ts
│   │   │   │   │   └── TextUtil.ts
│   │   │   │   ├── tools/
│   │   │   │   │   ├── Tool.ts             # 工具基类
│   │   │   │   │   ├── SelectTool.ts
│   │   │   │   │   ├── DrawTool.ts
│   │   │   │   │   └── VoiceTool.ts
│   │   │   │   ├── managers/
│   │   │   │   │   ├── HistoryManager.ts   # 历史管理
│   │   │   │   │   ├── SnapManager.ts      # 对齐管理
│   │   │   │   │   └── CameraManager.ts    # 相机管理
│   │   │   │   └── utils/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ai/                  # AI 服务（新增）
│   │   ├── src/
│   │   │   ├── VoiceService.ts
│   │   │   ├── RecognitionService.ts
│   │   │   ├── IdeaService.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── ui/                  # UI 组件（类似 @tldraw/tldraw）
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── Toolbar.tsx
│   │   │   │   ├── ChildrenToolbar.tsx    # 儿童友好工具栏
│   │   │   │   └── IdeaBubbles.tsx        # AI 创意气泡
│   │   │   ├── TSDraw.tsx                 # 主组件
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── schema/              # 数据模型（类似 @tldraw/tlschema）
│       ├── src/
│       │   ├── shapes/
│       │   │   ├── TLCircle.ts
│       │   │   ├── TLRect.ts
│       │   │   └── TLText.ts
│       │   ├── records/
│       │   │   ├── TLShape.ts
│       │   │   ├── TLPage.ts
│       │   │   └── TLCamera.ts
│       │   └── index.ts
│       └── package.json
│
├── apps/
│   └── demo/                # 演示应用
│       ├── src/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── package.json
│
├── docs/                    # 文档
│   ├── ARCHITECTURE.md      # 本文档
│   ├── API.md
│   └── MIGRATION.md         # 迁移到 tldraw 的指南
│
└── package.json
```

---

## 5. 数据模型

### 5.1 Shape（图形）

```typescript
// 基础图形接口
interface BaseShape {
  id: string
  type: string
  x: number
  y: number
  rotation: number
  parentId: string | null
  index: string  // 用于排序（fractional indexing）
  opacity: number
  isLocked: boolean
  meta: Record<string, any>
}

// 圆形
interface CircleShape extends BaseShape {
  type: 'circle'
  props: {
    radius: number
    fill: string
    stroke: string
    strokeWidth: number
  }
}

// 矩形
interface RectShape extends BaseShape {
  type: 'rect'
  props: {
    width: number
    height: number
    fill: string
    stroke: string
    strokeWidth: number
  }
}

// 文本
interface TextShape extends BaseShape {
  type: 'text'
  props: {
    text: string
    fontSize: number
    fontFamily: string
    color: string
    align: 'left' | 'center' | 'right'
  }
}

// 联合类型
type Shape = CircleShape | RectShape | TextShape
```

### 5.2 Camera（相机）

```typescript
interface Camera {
  id: string
  x: number
  y: number
  z: number  // zoom level
}
```

### 5.3 Instance（实例状态）

```typescript
interface Instance {
  id: string
  currentPageId: string
  selectedShapeIds: string[]
  hoveredShapeId: string | null
  editingShapeId: string | null
  currentToolId: string
}
```

---

## 6. 迁移策略

### 6.1 兼容性设计

**目标**：最小化迁移到 tldraw 的成本

**策略**：

1. **相似的 API 设计**
   ```typescript
   // 我们的 API
   editor.createShape({ type: 'circle', props: { radius: 50 } })
   
   // tldraw 的 API
   editor.createShape({ type: 'geo', props: { geo: 'circle', w: 100, h: 100 } })
   
   // 迁移时只需要写一个适配层
   ```

2. **相同的数据结构**
   - 使用相同的 Record 概念
   - 使用相同的 ID 生成策略
   - 使用相同的索引系统

3. **渐进式迁移**
   ```typescript
   // 第一步：替换 Store
   import { Store } from '@tldraw/store'  // 已经在用了
   
   // 第二步：替换 State
   import { atom } from '@tldraw/state'   // 已经在用了
   
   // 第三步：替换 Editor
   import { Editor } from '@tldraw/editor' // 付费后替换
   
   // 第四步：替换 UI
   import { Tldraw } from '@tldraw/tldraw' // 付费后替换
   ```

### 6.2 迁移检查清单

- [ ] 数据格式兼容
- [ ] API 接口相似
- [ ] 事件系统对齐
- [ ] 插件系统兼容
- [ ] 性能指标达标

### 6.3 何时迁移到 tldraw

**考虑迁移的时机**：

1. **需要企业级协作功能**
   - 实时同步
   - 冲突解决
   - 权限管理

2. **需要更多内置功能**
   - 更多图形类型
   - 更复杂的编辑能力
   - 更好的性能优化

3. **有预算支持**
   - tldraw 商业许可费用可接受
   - 团队规模扩大

**迁移步骤**：

```typescript
// 1. 安装 tldraw
npm install @tldraw/tldraw

// 2. 创建适配层
class TldrawAdapter {
  constructor(private editor: TldrawEditor) {}
  
  // 适配我们的 API 到 tldraw
  createShape(type: string, props: any) {
    return this.editor.createShape(
      this.convertToTldrawShape(type, props)
    )
  }
}

// 3. 逐步替换
// - 先替换底层（Store, State）
// - 再替换中层（Editor）
// - 最后替换 UI
```

---

## 7. 开发计划

### 第 1 周：基础架构
- [ ] 搭建项目结构
- [ ] 配置 monorepo
- [ ] 集成 @tldraw/state 和 @tldraw/store
- [ ] 实现基础 Editor 类

### 第 2-3 周：核心功能
- [ ] 实现 Shape 系统
- [ ] 实现 Tool 系统
- [ ] 实现渲染器
- [ ] 实现历史管理

### 第 4-5 周：AI 集成
- [ ] 语音识别
- [ ] 手绘识别
- [ ] 创意生成

### 第 6-7 周：儿童 UI
- [ ] 儿童友好界面
- [ ] 动画和反馈
- [ ] 语音提示

### 第 8 周：测试和优化
- [ ] 性能优化
- [ ] 用户测试
- [ ] Bug 修复

---

## 8. 法律合规

### 8.1 使用的开源库

| 库 | 许可证 | 用途 | 合规性 |
|-----|--------|------|--------|
| @tldraw/state | MIT | 状态管理 | ✅ 完全合法 |
| @tldraw/store | MIT | 数据存储 | ✅ 完全合法 |
| @tldraw/utils | MIT | 工具函数 | ✅ 完全合法 |
| react | MIT | UI 框架 | ✅ 完全合法 |
| react-konva | MIT | Canvas 渲染 | ✅ 完全合法 |

### 8.2 自己实现的部分

- ✅ Editor 类（学习思想，自己实现）
- ✅ Shape 系统（学习模式，自己实现）
- ✅ Tool 系统（学习模式，自己实现）
- ✅ AI 系统（完全原创）
- ✅ 儿童 UI（完全原创）

### 8.3 不使用的部分

- ❌ @tldraw/editor（需要付费许可）
- ❌ @tldraw/tldraw（需要付费许可）

---

## 9. 总结

### 9.1 核心优势

1. **合法合规** - 使用 MIT 许可的库
2. **架构先进** - 学习 tldraw 的设计思想
3. **易于迁移** - 保持 API 兼容性
4. **专注儿童** - 针对儿童场景优化
5. **AI 增强** - 原创的 AI 功能

### 9.2 技术亮点

1. **响应式状态** - 基于 @tldraw/state 的细粒度更新
2. **事务系统** - 基于 @tldraw/store 的批量更新
3. **插件化设计** - 易于扩展
4. **类型安全** - 完整的 TypeScript 支持

### 9.3 未来展望

- **短期**（3 个月）：完成核心功能，验证儿童场景
- **中期**（6 个月）：优化性能，扩展 AI 能力
- **长期**（1 年+）：根据需求决定是否迁移到 tldraw

---

**最后更新**：2025-11-23
**版本**：1.0.0
**作者**：TSDraw Team
