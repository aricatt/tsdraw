/**
 * ShapeUtil 基类
 * 学习自 tldraw 的 ShapeUtil，但完全自己实现
 * 
 * 每个图形类型都有一个对应的 ShapeUtil，负责：
 * - 渲染
 * - 边界计算
 * - 碰撞检测
 * - 默认属性
 */

import { Shape, Box, Point } from '../types/base-types'
import { Editor } from '../editor/Editor'

// ============================================================================
// ShapeUtil 基类
// ============================================================================

export abstract class ShapeUtil<T extends Shape = Shape> {
    /** 图形类型 */
    abstract readonly type: T['type']

    /** 编辑器引用 */
    protected editor: Editor

    constructor(editor: Editor) {
        this.editor = editor
    }

    // --------------------------------------------------------------------------
    // 抽象方法（必须实现）
    // --------------------------------------------------------------------------

    /**
     * 获取默认属性
     */
    abstract getDefaultProps(): T['props']

    /**
     * 计算边界框
     */
    abstract getBounds(shape: T): Box

    /**
     * 碰撞检测 - 点是否在图形内
     */
    abstract hitTest(shape: T, point: Point): boolean

    /**
     * 渲染组件（React）
     */
    abstract component(shape: T): React.ReactNode

    // --------------------------------------------------------------------------
    // 可选方法（有默认实现）
    // --------------------------------------------------------------------------

    /**
     * 获取中心点
     */
    getCenter(shape: T): Point {
        const bounds = this.getBounds(shape)
        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
        }
    }

    /**
     * 是否可以编辑
     */
    canEdit(shape: T): boolean {
        return false
    }

    /**
     * 是否可以调整大小
     */
    canResize(shape: T): boolean {
        return true
    }

    /**
     * 是否可以旋转
     */
    canRotate(shape: T): boolean {
        return true
    }

    /**
     * 是否可以绑定
     */
    canBind(shape: T): boolean {
        return false
    }

    /**
     * 获取调整大小的手柄
     */
    getResizeHandles(shape: T): ResizeHandle[] {
        return [
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'top',
            'right',
            'bottom',
            'left',
        ]
    }

    /**
     * 调整大小
     */
    onResize(shape: T, info: ResizeInfo): Partial<T> {
        // 默认实现：更新位置和大小
        return {
            x: info.bounds.x,
            y: info.bounds.y,
        } as Partial<T>
    }

    /**
     * 旋转
     */
    onRotate(shape: T, rotation: number): Partial<T> {
        return {
            rotation,
        } as Partial<T>
    }

    /**
     * 双击事件
     */
    onDoubleClick?(shape: T, event: React.MouseEvent): void

    /**
     * 开始编辑
     */
    onEditStart?(shape: T): void

    /**
     * 结束编辑
     */
    onEditEnd?(shape: T): void
}

// ============================================================================
// 辅助类型
// ============================================================================

export type ResizeHandle =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'right'
    | 'bottom'
    | 'left'

export interface ResizeInfo {
    bounds: Box
    scaleX: number
    scaleY: number
    handle: ResizeHandle
    isAspectRatioLocked: boolean
}

// ============================================================================
// ShapeUtil 注册表
// ============================================================================

export class ShapeUtilRegistry {
    private utils = new Map<string, ShapeUtil>()

    /**
     * 注册 ShapeUtil
     */
    register<T extends Shape>(util: ShapeUtil<T>): void {
        this.utils.set(util.type, util)
    }

    /**
     * 获取 ShapeUtil
     */
    get<T extends Shape>(type: string): ShapeUtil<T> | undefined {
        return this.utils.get(type) as ShapeUtil<T> | undefined
    }

    /**
     * 获取所有 ShapeUtil
     */
    getAll(): ShapeUtil[] {
        return Array.from(this.utils.values())
    }

    /**
     * 检查是否已注册
     */
    has(type: string): boolean {
        return this.utils.has(type)
    }
}
