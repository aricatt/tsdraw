/**
 * Editor 包的主入口（更新）
 */

// 导出类型
export * from './lib/types/base-types'

// 导出核心类
export { Editor } from './lib/editor/Editor'
export type { EditorOptions } from './lib/editor/Editor'

// 导出 Shape 系统
export * from './lib/shapes'

// 导出工具函数
export * from './lib/utils/geometry'

// 导出 @tldraw/state 和 @tldraw/store（MIT 许可）
export { atom, computed, react, transact } from '@tldraw/state'
export type { Atom, Computed } from '@tldraw/state'
export { Store } from '@tldraw/store'
export type { RecordId } from '@tldraw/store'
