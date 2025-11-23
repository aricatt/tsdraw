/**
 * Canvas 组件 - 核心渲染组件
 * 
 * 职责：
 * 1. 渲染所有图形
 * 2. 处理相机变换
 * 3. 处理鼠标事件
 * 4. 显示选择框
 */

import React, { useRef, useEffect } from 'react'
import { useAtomValue } from '../hooks/useAtomValue'
import { Editor, Shape, ShapeUtilRegistry } from '@tsdraw/editor'
import { ShapeRenderer } from './ShapeRenderer'
import { SelectionBox } from './SelectionBox'
import { CanvasBackground } from './CanvasBackground'
import './Canvas.css'

// ============================================================================
// Canvas Props
// ============================================================================

export interface CanvasProps {
    /** 编辑器实例 */
    editor: Editor

    /** ShapeUtil 注册表 */
    shapeUtils: ShapeUtilRegistry

    /** 画布宽度 */
    width?: number

    /** 画布高度 */
    height?: number

    /** 是否显示网格 */
    showGrid?: boolean

    /** 类名 */
    className?: string
}

// ============================================================================
// Canvas Component
// ============================================================================

export const Canvas: React.FC<CanvasProps> = ({
    editor,
    shapeUtils,
    width = 1920,
    height = 1080,
    showGrid = false,
    className,
}) => {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // 订阅响应式状态
    const shapes = useAtomValue(editor.currentPageShapes)
    const selectedIds = useAtomValue(editor.selectedShapeIdsAtom)
    const camera = useAtomValue(editor.cameraAtom)

    // 计算 SVG 变换
    const transform = `translate(${camera.x}, ${camera.y}) scale(${camera.z})`

    // 处理鼠标事件
    const handlePointerDown = (e: React.PointerEvent) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        editor.pointerDown({ x: e.clientX, y: e.clientY, z: 0 })
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        editor.pointerMove({ x: e.clientX, y: e.clientY, z: 0 })
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        editor.pointerUp({ x: e.clientX, y: e.clientY, z: 0 })
    }

    // 处理滚轮事件（缩放和平移）
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()

            // 获取最新的 camera 状态
            const currentCamera = editor.camera

            if (e.ctrlKey || e.metaKey) {
                // 缩放
                const delta = -e.deltaY * 0.01
                const newZoom = Math.max(0.1, Math.min(8, currentCamera.z * (1 + delta)))
                editor.setCamera(currentCamera.x, currentCamera.y, newZoom)
            } else {
                // 平移
                editor.setCamera(
                    currentCamera.x - e.deltaX,
                    currentCamera.y - e.deltaY,
                    currentCamera.z
                )
            }
        }

        container.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            container.removeEventListener('wheel', handleWheel)
        }
    }, [editor])

    return (
        <div
            ref={containerRef}
            className={`tsdraw-canvas ${className || ''}`}
            style={{ width, height }}
            onPointerMove={handlePointerMove} // Moved onPointerMove here
        >
            <svg
                ref={svgRef}
                width={width}
                height={height}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{ cursor: 'default' }}
            >
                {/* 背景 */}
                {showGrid && <CanvasBackground camera={camera} />}

                {/* 主渲染组 */}
                <g transform={transform}>
                    {/* 渲染所有图形 */}
                    {shapes.map(shape => (
                        <ShapeRenderer
                            key={shape.id}
                            shape={shape}
                            shapeUtil={shapeUtils.get(shape.type)}
                            isSelected={selectedIds.has(shape.id)}
                        />
                    ))}

                    {/* 选择框 */}
                    {selectedIds.size > 0 && (
                        <SelectionBox
                            shapes={shapes.filter(s => selectedIds.has(s.id))}
                            shapeUtils={shapeUtils}
                        />
                    )}
                </g>
            </svg>
        </div>
    )
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取 SVG 坐标系中的点
 */
function getSVGPoint(
    svg: SVGSVGElement,
    clientX: number,
    clientY: number,
    camera: { x: number; y: number; z: number }
): { x: number; y: number } {
    const rect = svg.getBoundingClientRect()

    // 转换为 SVG 坐标
    const x = (clientX - rect.left - camera.x) / camera.z
    const y = (clientY - rect.top - camera.y) / camera.z

    return { x, y }
}

/**
 * 查找点击的图形
 */
function findShapeAtPoint(
    shapes: Shape[],
    point: { x: number; y: number },
    shapeUtils: ShapeUtilRegistry
): Shape | null {
    // 从后往前查找（后面的图形在上层）
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i]
        const util = shapeUtils.get(shape.type)

        if (util && util.hitTest(shape, point)) {
            return shape
        }
    }

    return null
}
