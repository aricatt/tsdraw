# TSDraw Editor

核心编辑器包，学习自 tldraw 的设计思想。

## 特性

- ✅ 使用 `@tldraw/state`（MIT）实现响应式状态管理
- ✅ 使用 `@tldraw/store`（MIT）实现数据存储
- ✅ 完全自己实现的 Editor 类
- ✅ 类型安全的 TypeScript API
- ✅ 为未来迁移到 tldraw 做好准备

## 安装

```bash
npm install @tsdraw/editor
```

## 使用

```typescript
import { Editor, Store } from '@tsdraw/editor'

// 创建 store
const store = new Store({ /* ... */ })

// 创建 editor
const editor = new Editor({ store })

// 创建图形
const circle = editor.createShape('circle', {
  radius: 50,
  fill: 'red'
}, {
  x: 100,
  y: 100
})

// 选择图形
editor.selectShape(circle.id)

// 更新图形
editor.updateShape(circle.id, {
  props: { radius: 100 }
})

// 删除图形
editor.deleteShape(circle.id)
```

## API 文档

详见 [API.md](../../docs/API.md)

## 许可证

MIT
