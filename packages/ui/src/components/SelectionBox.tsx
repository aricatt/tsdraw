/**
 * SelectionBox - 选择框组件
 * 显示选中图形的边界框和调整手柄
 */

import React from 'react'
import { Shape, ShapeUtilRegistry, Box, unionBoxes } from '@tsdraw/editor'

export interface SelectionBoxProps {
    shapes: Shape[]
    shapeUtils: ShapeUtilRegistry
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
    shapes,
    shapeUtils,
}) => {
    if (shapes.length === 0) return null

    // 计算所有选中图形的总边界
    const bounds = getSelectionBounds(shapes, shapeUtils)

    if (!bounds) return null

    const { x, y, width, height } = bounds

    // 调整手柄的大小
    const handleSize = 8
    const halfHandle = handleSize / 2

    return (
        <g className="selection-box" pointerEvents="none">
            {/* 边界框 */}
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="none"
                stroke="#1e90ff"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                rx={2}
            />

            {/* 调整手柄 */}
            {/* 四个角 */}
            <ResizeHandle x={x} y={y} size={handleSize} cursor="nwse-resize" />
            <ResizeHandle x={x + width} y={y} size={handleSize} cursor="nesw-resize" />
            <ResizeHandle x={x} y={y + height} size={handleSize} cursor="nesw-resize" />
            <ResizeHandle x={x + width} y={y + height} size={handleSize} cursor="nwse-resize" />

            {/* 四条边 */}
            <ResizeHandle x={x + width / 2} y={y} size={handleSize} cursor="ns-resize" />
            <ResizeHandle x={x + width} y={y + height / 2} size={handleSize} cursor="ew-resize" />
            <ResizeHandle x={x + width / 2} y={y + height} size={handleSize} cursor="ns-resize" />
            <ResizeHandle x={x} y={y + height / 2} size={handleSize} cursor="ew-resize" />
        </g>
    )
}

// ============================================================================
// ResizeHandle 组件
// ============================================================================

interface ResizeHandleProps {
    x: number
    y: number
    size: number
    cursor: string
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ x, y, size, cursor }) => {
    const half = size / 2

    return (
        <rect
            x={x - half}
            y={y - half}
            width={size}
            height={size}
            fill="white"
            stroke="#1e90ff"
            strokeWidth={1.5}
            rx={2}
            style={{ cursor }}
            pointerEvents="all"
        />
    )
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 获取选中图形的总边界
 */
function getSelectionBounds(
    shapes: Shape[],
    shapeUtils: ShapeUtilRegistry
): Box | null {
    const boxes: Box[] = []

    for (const shape of shapes) {
        const util = shapeUtils.get(shape.type)
        if (util) {
            boxes.push(util.getBounds(shape))
        }
    }

    if (boxes.length === 0) return null

    return unionBoxes(boxes)
}
