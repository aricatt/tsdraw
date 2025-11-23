/**
 * 核心编辑器类
 * 学习自 tldraw 的 Editor，但完全自己实现
 * 
 * 设计思想：
 * 1. 中心化管理所有状态和操作
 * 2. 提供统一的 API
 * 3. 使用 @tldraw/store 管理数据
 * 4. 使用 @tldraw/state 实现响应式
 */

import { Store, StoreSchema } from '@tldraw/store'
import { atom, computed, Atom, Computed } from '@tldraw/state'
import {
    Shape,
    ShapeId,
    PageId,
    CameraId,
    InstanceId,
    PageRecord,
    CameraRecord,
    InstanceRecord,
    Point,
    Box,
    createShapeId,
    createPageId,
    createCameraId,
    createInstanceId,
} from '../types/base-types'

// ============================================================================
// Editor 配置
// ============================================================================

/**
 * 创建默认的 Store Schema
 */
export function createDefaultSchema() {
    return StoreSchema.create({
        shape: {
            typeName: 'shape',
            createId: (id: any) => id,
            validate: (record: any) => record,
        },
        page: {
            typeName: 'page',
            createId: (id: any) => id,
            validate: (record: any) => record,
        },
        camera: {
            typeName: 'camera',
            createId: (id: any) => id,
            validate: (record: any) => record,
        },
        instance: {
            typeName: 'instance',
            createId: (id: any) => id,
            validate: (record: any) => record,
        },
    })
}

export interface EditorOptions {
    /** 数据存储 */
    store: Store<any>

    /** 初始页面 ID */
    initialPageId?: PageId

    /** 是否自动聚焦 */
    autoFocus?: boolean

    /** 相机选项 */
    cameraOptions?: {
        minZoom?: number
        maxZoom?: number
        wheelBehavior?: 'zoom' | 'pan' | 'none'
    }
}

// ============================================================================
// Editor 类
// ============================================================================

export class Editor {
    /** 唯一 ID */
    readonly id = crypto.randomUUID()

    /** 数据存储（使用 @tldraw/store） */
    readonly store: Store<any>

    /** 实例 ID */
    readonly instanceId: InstanceId

    /** 配置 */
    private readonly options: Required<EditorOptions>

    // ------------------------------------------------------------------------
    // 响应式状态（使用 @tldraw/state）
    // ------------------------------------------------------------------------

    /** 当前页面 ID */
    private readonly _currentPageId: Atom<PageId>

    /** 当前工具 ID */
    private readonly _currentToolId: Atom<string>

    /** 选中的图形 IDs */
    private readonly _selectedShapeIds: Atom<Set<ShapeId>>

    /** 悬停的图形 ID */
    private readonly _hoveredShapeId: Atom<ShapeId | null>

    /** 正在编辑的图形 ID */
    private readonly _editingShapeId: Atom<ShapeId | null>

    /** 相机状态 */
    private readonly _camera: Atom<{ x: number; y: number; z: number }>

    /** 内部图形存储（临时方案，后续会用 Store 替代） */
    private readonly _shapes: Atom<Map<ShapeId, Shape>>

    // ------------------------------------------------------------------------
    // 计算属性（使用 @tldraw/state computed）
    // ------------------------------------------------------------------------

    /** 当前页面的所有图形 */
    readonly currentPageShapes: Computed<Shape[]>

    /** 选中的图形 */
    readonly selectedShapes: Computed<Shape[]>

    /** 当前页面 */
    readonly currentPage: Computed<PageRecord | null>

    // ------------------------------------------------------------------------
    // 公共访问器（用于 UI 组件）
    // ------------------------------------------------------------------------

    /** 当前页面 ID（响应式） */
    readonly currentPageIdAtom: Atom<PageId>

    /** 当前工具 ID（响应式） */
    readonly currentToolIdAtom: Atom<string>

    /** 选中的图形 IDs（响应式） */
    readonly selectedShapeIdsAtom: Atom<Set<ShapeId>>

    /** 相机状态（响应式） */
    readonly cameraAtom: Atom<{ x: number; y: number; z: number }>

    // ------------------------------------------------------------------------
    // 构造函数
    // ------------------------------------------------------------------------

    constructor(options: EditorOptions) {
        this.store = options.store
        this.instanceId = createInstanceId()

        // 设置默认配置
        this.options = {
            ...options,
            autoFocus: options.autoFocus ?? true,
            initialPageId: options.initialPageId ?? createPageId(),
            cameraOptions: {
                minZoom: 0.1,
                maxZoom: 8,
                wheelBehavior: 'zoom',
                ...options.cameraOptions,
            },
        }

        // 初始化响应式状态
        this._currentPageId = atom('currentPageId', this.options.initialPageId)
        this._currentToolId = atom('currentToolId', 'select')
        this._selectedShapeIds = atom('selectedShapeIds', new Set<ShapeId>())
        this._hoveredShapeId = atom('hoveredShapeId', null)
        this._editingShapeId = atom('editingShapeId', null)
        this._camera = atom('camera', { x: 0, y: 0, z: 1 })
        this._shapes = atom('shapes', new Map<ShapeId, Shape>())

        // 设置公共访问器（用于 UI 组件）
        this.currentPageIdAtom = this._currentPageId
        this.currentToolIdAtom = this._currentToolId
        this.selectedShapeIdsAtom = this._selectedShapeIds
        this.cameraAtom = this._camera

        // 初始化计算属性
        this.currentPageShapes = computed('currentPageShapes', () => {
            const pageId = this._currentPageId.get()
            // 从 store 获取当前页面的所有图形
            return this.getShapesInPage(pageId)
        })

        this.selectedShapes = computed('selectedShapes', () => {
            const selectedIds = this._selectedShapeIds.get()
            const allShapes = this.currentPageShapes.get()
            return allShapes.filter(shape => selectedIds.has(shape.id))
        })

        this.currentPage = computed('currentPage', () => {
            const pageId = this._currentPageId.get()
            return this.store.get(pageId) as PageRecord | null
        })

        // 初始化默认页面
        this.initializeDefaultPage()
    }

    // ========================================================================
    // 公共 API - 图形操作
    // ========================================================================

    /**
     * 创建图形
     */
    createShape<T extends Shape>(
        type: T['type'],
        props: Partial<T['props']>,
        options?: {
            x?: number
            y?: number
            parentId?: ShapeId | PageId
        }
    ): T {
        const id = createShapeId()
        const pageId = this._currentPageId.get()

        // 构建完整的图形对象
        const shape = {
            id,
            typeName: 'shape',
            type,
            x: options?.x ?? 0,
            y: options?.y ?? 0,
            rotation: 0,
            parentId: options?.parentId ?? pageId,
            index: this.generateIndex(),
            opacity: 1,
            isLocked: false,
            meta: {},
            props: this.getDefaultProps(type, props),
        } as T

        // 添加到内部存储
        const shapesMap = this._shapes.get()
        shapesMap.set(id, shape)
        this._shapes.set(new Map(shapesMap))

        // 也添加到 store（为了兼容性）
        try {
            this.store.put([shape])
        } catch (e) {
            // Store 可能还未完全配置，暂时忽略错误
            console.warn('Store.put failed:', e)
        }

        return shape
    }

    /**
     * 更新图形
     */
    updateShape<T extends Shape>(
        id: ShapeId,
        changes: Partial<T>
    ): void {
        const shapesMap = this._shapes.get()
        const shape = shapesMap.get(id) as T | undefined

        if (!shape) {
            console.warn(`Shape ${id} not found`)
            return
        }

        const updated = { ...shape, ...changes }

        // 更新内部存储
        shapesMap.set(id, updated)
        this._shapes.set(new Map(shapesMap))

        // 也更新 store
        try {
            this.store.put([updated])
        } catch (e) {
            console.warn('Store.put failed:', e)
        }
    }

    /**
     * 删除图形
     */
    deleteShape(id: ShapeId): void {
        // 从内部存储删除
        const shapesMap = this._shapes.get()
        shapesMap.delete(id)
        this._shapes.set(new Map(shapesMap))

        // 也从 store 删除
        try {
            this.store.remove([id])
        } catch (e) {
            console.warn('Store.remove failed:', e)
        }

        // 如果删除的是选中的图形，清除选择
        const selectedIds = this._selectedShapeIds.get()
        if (selectedIds.has(id)) {
            selectedIds.delete(id)
            this._selectedShapeIds.set(new Set(selectedIds))
        }
    }

    /**
     * 批量删除图形
     */
    deleteShapes(ids: ShapeId[]): void {
        this.store.remove(ids)

        // 清除选择
        const selectedIds = this._selectedShapeIds.get()
        ids.forEach(id => selectedIds.delete(id))
        this._selectedShapeIds.set(new Set(selectedIds))
    }

    // ========================================================================
    // 公共 API - 选择操作
    // ========================================================================

    /**
     * 选择图形
     */
    selectShape(id: ShapeId): void {
        this._selectedShapeIds.set(new Set([id]))
    }

    /**
     * 添加到选择
     */
    addToSelection(id: ShapeId): void {
        const selectedIds = this._selectedShapeIds.get()
        selectedIds.add(id)
        this._selectedShapeIds.set(new Set(selectedIds))
    }

    /**
     * 从选择中移除
     */
    removeFromSelection(id: ShapeId): void {
        const selectedIds = this._selectedShapeIds.get()
        selectedIds.delete(id)
        this._selectedShapeIds.set(new Set(selectedIds))
    }

    /**
     * 选择所有图形
     */
    selectAll(): void {
        const allShapes = this.currentPageShapes.get()
        const allIds = new Set(allShapes.map(s => s.id))
        this._selectedShapeIds.set(allIds)
    }

    /**
     * 清除选择
     */
    clearSelection(): void {
        this._selectedShapeIds.set(new Set())
    }

    // ========================================================================
    // 公共 API - 相机操作
    // ========================================================================

    /**
     * 设置相机位置
     */
    setCamera(x: number, y: number, z?: number): void {
        const current = this._camera.get()
        this._camera.set({
            x,
            y,
            z: z ?? current.z,
        })
    }

    /**
     * 缩放
     */
    zoomIn(): void {
        const current = this._camera.get()
        const newZoom = Math.min(
            current.z * 1.2,
            this.options.cameraOptions.maxZoom
        )
        this._camera.set({ ...current, z: newZoom })
    }

    zoomOut(): void {
        const current = this._camera.get()
        const newZoom = Math.max(
            current.z / 1.2,
            this.options.cameraOptions.minZoom
        )
        this._camera.set({ ...current, z: newZoom })
    }

    /**
     * 重置相机
     */
    resetCamera(): void {
        this._camera.set({ x: 0, y: 0, z: 1 })
    }

    /**
     * 缩放到适应所有图形
     */
    zoomToFit(): void {
        const shapes = this.currentPageShapes.get()
        if (shapes.length === 0) return

        // 计算所有图形的边界
        const bounds = this.getShapesBounds(shapes)

        // 计算需要的缩放级别
        // TODO: 实现缩放到适应的逻辑
    }

    // ========================================================================
    // 公共 API - 工具操作
    // ========================================================================

    /**
     * 设置当前工具
     */
    setCurrentTool(toolId: string): void {
        this._currentToolId.set(toolId)
    }

    /**
     * 获取当前工具
     */
    getCurrentTool(): string {
        return this._currentToolId.get()
    }

    /**
     * 设置正在编辑的图形
     */
    setEditingShapeId(shapeId: ShapeId | null): void {
        this._editingShapeId.set(shapeId)
    }

    // ========================================================================
    // 公共 API - 历史操作（TODO: 实现）
    // ========================================================================

    undo(): void {
        // TODO: 实现 undo
        console.log('undo - to be implemented')
    }

    redo(): void {
        // TODO: 实现 redo
        console.log('redo - to be implemented')
    }

    // ========================================================================
    // 公共 API - 批量操作
    // ========================================================================

    /**
     * 批量执行操作（事务）
     */
    batch(fn: () => void): void {
        // 使用 store 的批量更新
        this.store.atomic(() => {
            fn()
        })
    }

    // ========================================================================
    // 私有方法
    // ========================================================================

    /**
     * 初始化默认页面
     */
    private initializeDefaultPage(): void {
        const pageId = this.options.initialPageId

        // 检查页面是否已存在
        const existingPage = this.store.get(pageId)
        if (existingPage) return

        // 创建默认页面
        const page: PageRecord = {
            id: pageId,
            typeName: 'page',
            name: 'Page 1',
            index: 'a0',
            meta: {},
        }

        this.store.put([page])
    }

    /**
     * 获取页面中的所有图形
     */
    private getShapesInPage(pageId: PageId): Shape[] {
        const shapesMap = this._shapes.get()
        const shapes: Shape[] = []

        // 过滤出属于当前页面的图形
        for (const shape of shapesMap.values()) {
            if (shape.parentId === pageId) {
                shapes.push(shape)
            }
        }

        // 按 index 排序
        return shapes.sort((a, b) => a.index.localeCompare(b.index))
    }

    /**
     * 生成索引（用于排序）
     */
    private generateIndex(): string {
        // TODO: 实现 fractional indexing
        // 暂时返回随机字符串
        return Math.random().toString(36).substring(2, 9)
    }

    /**
     * 获取图形的默认属性
     */
    private getDefaultProps(type: string, props: any): any {
        // TODO: 根据图形类型返回默认属性
        const defaults: Record<string, any> = {
            circle: {
                radius: 50,
                fill: '#e3e3e3',
                stroke: '#1e1e1e',
                strokeWidth: 2,
            },
            rect: {
                width: 100,
                height: 100,
                fill: '#e3e3e3',
                stroke: '#1e1e1e',
                strokeWidth: 2,
                cornerRadius: 0,
            },
            text: {
                text: '',
                fontSize: 16,
                fontFamily: 'sans-serif',
                color: '#1e1e1e',
                align: 'left',
                autoSize: true,
            },
        }

        return { ...defaults[type], ...props }
    }

    /**
     * 计算多个图形的边界
     */
    private getShapesBounds(shapes: Shape[]): Box {
        // TODO: 实现边界计算
        return { x: 0, y: 0, width: 0, height: 0 }
    }

    // ========================================================================
    // 公共 Getters（响应式）
    // ========================================================================

    get currentPageId(): PageId {
        return this._currentPageId.get()
    }

    get selectedShapeIds(): Set<ShapeId> {
        return this._selectedShapeIds.get()
    }

    get hoveredShapeId(): ShapeId | null {
        return this._hoveredShapeId.get()
    }

    get editingShapeId(): ShapeId | null {
        return this._editingShapeId.get()
    }

    get camera(): { x: number; y: number; z: number } {
        return this._camera.get()
    }
}
