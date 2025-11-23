# 迁移到 tldraw 指南

本文档说明如何从 TSDraw 迁移到官方的 tldraw。

## 为什么要迁移？

当你的项目需要以下功能时，考虑迁移到 tldraw：

1. **企业级协作功能**
   - 实时多人同步
   - 冲突解决
   - 权限管理

2. **更多内置功能**
   - 更丰富的图形类型
   - 更强大的编辑能力
   - 更好的性能优化

3. **官方支持**
   - 持续更新
   - 技术支持
   - 社区资源

## 迁移准备

### 1. 评估迁移成本

TSDraw 的设计考虑了与 tldraw 的兼容性，迁移成本相对较低：

| 模块 | 迁移难度 | 说明 |
|------|---------|------|
| Store | ⭐ 简单 | 已经在使用 @tldraw/store |
| State | ⭐ 简单 | 已经在使用 @tldraw/state |
| Editor API | ⭐⭐ 中等 | API 设计相似，需要适配 |
| Shape 系统 | ⭐⭐⭐ 较难 | 需要重写为 tldraw 的 ShapeUtil |
| UI 组件 | ⭐⭐⭐⭐ 困难 | 儿童 UI 需要保留并适配 |
| AI 功能 | ⭐ 简单 | 独立模块，可直接复用 |

### 2. 获取 tldraw 许可证

访问 [tldraw.dev](https://tldraw.dev) 获取商业许可证。

## 迁移步骤

### 第 1 步：安装 tldraw

```bash
npm install @tldraw/tldraw @tldraw/editor
```

### 第 2 步：创建适配层

创建一个适配层，将 TSDraw 的 API 映射到 tldraw：

```typescript
// adapters/TldrawAdapter.ts
import { Editor as TldrawEditor } from '@tldraw/editor'
import { Editor as TSDrawEditor } from '@tsdraw/editor'

export class TldrawAdapter {
  private tldrawEditor: TldrawEditor
  
  constructor(tldrawEditor: TldrawEditor) {
    this.tldrawEditor = tldrawEditor
  }
  
  // 适配 createShape
  createShape(type: string, props: any, options?: any) {
    // 将 TSDraw 的参数转换为 tldraw 的格式
    const tldrawShape = this.convertToTldrawShape(type, props, options)
    return this.tldrawEditor.createShape(tldrawShape)
  }
  
  // 适配 updateShape
  updateShape(id: string, changes: any) {
    return this.tldrawEditor.updateShape(id, changes)
  }
  
  // ... 其他方法的适配
  
  private convertToTldrawShape(type: string, props: any, options: any) {
    // 转换逻辑
    const typeMap: Record<string, string> = {
      'circle': 'geo',  // TSDraw 的 circle 对应 tldraw 的 geo
      'rect': 'geo',
      'text': 'text',
    }
    
    return {
      type: typeMap[type] || type,
      props: this.convertProps(type, props),
      x: options?.x ?? 0,
      y: options?.y ?? 0,
    }
  }
  
  private convertProps(type: string, props: any) {
    // 属性转换逻辑
    if (type === 'circle') {
      return {
        geo: 'ellipse',
        w: props.radius * 2,
        h: props.radius * 2,
        fill: props.fill,
        // ...
      }
    }
    return props
  }
}
```

### 第 3 步：逐步替换

#### 3.1 替换 Editor

```typescript
// 旧代码（TSDraw）
import { Editor } from '@tsdraw/editor'

const editor = new Editor({ store })

// 新代码（tldraw + 适配层）
import { Editor } from '@tldraw/editor'
import { TldrawAdapter } from './adapters/TldrawAdapter'

const tldrawEditor = new Editor({ store })
const editor = new TldrawAdapter(tldrawEditor)

// API 保持不变！
editor.createShape('circle', { radius: 50 })
```

#### 3.2 替换 UI

```typescript
// 旧代码（TSDraw）
import { TSDraw } from '@tsdraw/ui'

function App() {
  return <TSDraw />
}

// 新代码（tldraw + 自定义 UI）
import { Tldraw } from '@tldraw/tldraw'
import { ChildrenToolbar } from './components/ChildrenToolbar'

function App() {
  return (
    <Tldraw>
      <ChildrenToolbar />  {/* 保留儿童友好 UI */}
    </Tldraw>
  )
}
```

#### 3.3 保留 AI 功能

```typescript
// AI 功能是独立的，可以直接复用
import { AIService } from '@tsdraw/ai'
import { Editor } from '@tldraw/editor'

const ai = new AIService()
const editor = new Editor({ /* ... */ })

// 集成 AI
editor.createShapeByVoice = async (audio: Blob) => {
  const shape = await ai.voiceToShape(audio)
  return editor.createShape(shape)
}
```

### 第 4 步：测试

创建测试用例，确保迁移后功能正常：

```typescript
// tests/migration.test.ts
import { describe, it, expect } from 'vitest'
import { TldrawAdapter } from '../adapters/TldrawAdapter'

describe('Migration to tldraw', () => {
  it('should create circle shape', () => {
    const adapter = new TldrawAdapter(tldrawEditor)
    const circle = adapter.createShape('circle', { radius: 50 })
    
    expect(circle).toBeDefined()
    expect(circle.type).toBe('geo')
  })
  
  // 更多测试...
})
```

## 迁移检查清单

### 功能检查

- [ ] 图形创建正常
- [ ] 图形编辑正常
- [ ] 选择功能正常
- [ ] 历史记录正常
- [ ] 相机操作正常
- [ ] AI 功能正常
- [ ] 儿童 UI 正常

### 性能检查

- [ ] 大量图形时性能正常
- [ ] 缩放流畅
- [ ] 拖拽流畅
- [ ] 内存占用合理

### 数据检查

- [ ] 旧数据可以导入
- [ ] 数据格式兼容
- [ ] 导出功能正常

## 常见问题

### Q: 迁移需要多长时间？

A: 根据项目规模，通常需要 1-2 周：
- 小型项目（<1000 行代码）：3-5 天
- 中型项目（1000-5000 行）：1-2 周
- 大型项目（>5000 行）：2-4 周

### Q: 迁移后性能会提升吗？

A: 是的，tldraw 的性能优化更完善：
- 更好的 viewport culling
- 更高效的渲染
- 更优的内存管理

### Q: 可以部分迁移吗？

A: 可以！建议的迁移顺序：
1. 先迁移 Editor（核心）
2. 再迁移 UI（界面）
3. 最后迁移自定义功能

### Q: AI 功能会丢失吗？

A: 不会！AI 功能是独立的，可以完全保留。

## 获取帮助

如果迁移过程中遇到问题：

1. 查看 [tldraw 官方文档](https://tldraw.dev/docs)
2. 在 [GitHub Issues](https://github.com/tldraw/tldraw/issues) 提问
3. 联系 tldraw 技术支持（商业许可用户）

## 总结

TSDraw 的设计充分考虑了与 tldraw 的兼容性，迁移过程相对平滑：

✅ **优势**：
- 使用相同的底层库（@tldraw/state, @tldraw/store）
- API 设计相似
- 可以渐进式迁移

⚠️ **注意**：
- 需要适配 Shape 系统
- 需要调整 UI 组件
- 需要测试所有功能

🎯 **建议**：
- 在迁移前做好备份
- 创建完整的测试用例
- 逐步迁移，不要一次性全部替换
