# TSDraw UI

React UI 组件包，提供完整的画板界面。

## 组件

### TSDraw
主组件，包含画布和工具栏。

```tsx
import { TSDraw } from '@tsdraw/ui'

function App() {
  return (
    <TSDraw
      width={1920}
      height={1080}
      showGrid={true}
      showToolbar={true}
    />
  )
}
```

### Canvas
画布组件，负责渲染图形。

### Toolbar
工具栏组件，提供工具选择和操作按钮。

## 特性

- ✅ SVG 渲染
- ✅ 响应式状态管理
- ✅ 选择和拖拽
- ✅ 缩放和平移
- ✅ 网格背景
- ✅ 工具栏

## 许可证

MIT
