/**
 * Shape 系统导出
 */

export { ShapeUtil, ShapeUtilRegistry } from './ShapeUtil'
export type { ResizeHandle, ResizeInfo } from './ShapeUtil'

export { CircleShapeUtil } from './CircleShapeUtil'
export { RectShapeUtil } from './RectShapeUtil'
export { TextShapeUtil } from './TextShapeUtil'
export { DrawShapeUtil } from './DrawShapeUtil'

// 创建默认的 ShapeUtil 注册表
import { ShapeUtilRegistry } from './ShapeUtil'
import { CircleShapeUtil } from './CircleShapeUtil'
import { RectShapeUtil } from './RectShapeUtil'
import { TextShapeUtil } from './TextShapeUtil'
import { DrawShapeUtil } from './DrawShapeUtil'
import { Editor } from '../editor/Editor'

/**
 * 创建并注册所有默认的 ShapeUtils
 */
export function createDefaultShapeUtils(editor: Editor): ShapeUtilRegistry {
    const registry = new ShapeUtilRegistry()

    registry.register(new CircleShapeUtil(editor))
    registry.register(new RectShapeUtil(editor))
    registry.register(new TextShapeUtil(editor))
    registry.register(new DrawShapeUtil(editor))

    return registry
}
