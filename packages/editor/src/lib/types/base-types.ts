/**
 * 基础类型定义
 * 学习自 tldraw，但使用自己的命名和实现
 */

// ============================================================================
// 基础几何类型
// ============================================================================

/** 2D 点 */
export interface Point {
    x: number
    y: number
}

/** 边界框 */
export interface Box {
    x: number
    y: number
    width: number
    height: number
}

/** 向量（用于计算） */
export interface Vec {
    x: number
    y: number
    z?: number
}

// ============================================================================
// ID 类型
// ============================================================================

/** 图形 ID */
export type ShapeId = string & { __shapeId: true }

/** 页面 ID */
export type PageId = string & { __pageId: true }

/** 相机 ID */
export type CameraId = string & { __cameraId: true }

/** 实例 ID */
export type InstanceId = string & { __instanceId: true }

// ============================================================================
// 基础 Record 类型（学习自 @tldraw/store）
// ============================================================================

/** 基础 Record 接口 */
export interface BaseRecord {
    id: string
    typeName: string
}

/** Record 类型映射 */
export interface RecordTypeMap {
    shape: ShapeRecord
    page: PageRecord
    camera: CameraRecord
    instance: InstanceRecord
}

// ============================================================================
// Shape（图形）
// ============================================================================

/** 基础图形属性 */
export interface BaseShape extends BaseRecord {
    typeName: 'shape'
    id: ShapeId
    type: string
    x: number
    y: number
    rotation: number
    parentId: ShapeId | PageId
    index: string  // fractional indexing
    opacity: number
    isLocked: boolean
    meta: Record<string, any>
}

/** 圆形 */
export interface CircleShape extends BaseShape {
    type: 'circle'
    props: {
        radius: number
        fill: string
        stroke: string
        strokeWidth: number
    }
}

/** 矩形 */
export interface RectShape extends BaseShape {
    type: 'rect'
    props: {
        width: number
        height: number
        fill: string
        stroke: string
        strokeWidth: number
        cornerRadius: number
    }
}

/** 文本 */
export interface TextShape extends BaseShape {
    type: 'text'
    props: {
        text: string
        fontSize: number
        fontFamily: string
        color: string
        align: 'left' | 'center' | 'right'
        autoSize: boolean
    }
}

/** 手绘 */
export interface DrawShape extends BaseShape {
    type: 'draw'
    props: {
        points: Point[]
        color: string
        size: number
        isClosed: boolean
    }
}

/** 所有图形类型的联合 */
export type Shape = CircleShape | RectShape | TextShape | DrawShape

/** Shape Record */
export type ShapeRecord = Shape

// ============================================================================
// Page（页面）
// ============================================================================

export interface PageRecord extends BaseRecord {
    typeName: 'page'
    id: PageId
    name: string
    index: string
    meta: Record<string, any>
}

// ============================================================================
// Camera（相机）
// ============================================================================

export interface CameraRecord extends BaseRecord {
    typeName: 'camera'
    id: CameraId
    x: number
    y: number
    z: number  // zoom level
}

// ============================================================================
// Instance（实例状态）
// ============================================================================

export interface InstanceRecord extends BaseRecord {
    typeName: 'instance'
    id: InstanceId
    currentPageId: PageId
    currentToolId: string
    selectedShapeIds: ShapeId[]
    hoveredShapeId: ShapeId | null
    editingShapeId: ShapeId | null
    erasingShapeIds: ShapeId[]
}

// ============================================================================
// 工具类型
// ============================================================================

export type ToolId =
    | 'select'
    | 'draw'
    | 'circle'
    | 'rect'
    | 'text'
    | 'voice'
    | 'hand'
    | 'eraser'

// ============================================================================
// 事件类型
// ============================================================================

export interface PointerEventInfo {
    type: 'pointer'
    target: 'canvas' | 'shape'
    shapeId?: ShapeId
    point: Point
    pointInShapeSpace?: Point
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    button: number
    isPen: boolean
}

export interface KeyboardEventInfo {
    type: 'keyboard'
    key: string
    code: string
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    metaKey: boolean
}

// ============================================================================
// 工具函数
// ============================================================================

/** 创建类型安全的 ID */
export function createShapeId(): ShapeId {
    return crypto.randomUUID() as ShapeId
}

export function createPageId(): PageId {
    return crypto.randomUUID() as PageId
}

export function createCameraId(): CameraId {
    return crypto.randomUUID() as CameraId
}

export function createInstanceId(): InstanceId {
    return crypto.randomUUID() as InstanceId
}

/** 类型守卫 */
export function isCircleShape(shape: Shape): shape is CircleShape {
    return shape.type === 'circle'
}

export function isRectShape(shape: Shape): shape is RectShape {
    return shape.type === 'rect'
}

export function isTextShape(shape: Shape): shape is TextShape {
    return shape.type === 'text'
}

export function isDrawShape(shape: Shape): shape is DrawShape {
    return shape.type === 'draw'
}
