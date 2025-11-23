/**
 * ShapeRenderer - 渲染单个图形
 */

import React from 'react'
import { Shape, ShapeUtil } from '@tsdraw/editor'

export interface ShapeRendererProps {
    shape: Shape
    shapeUtil: ShapeUtil | undefined
    isSelected: boolean
}

export const ShapeRenderer: React.FC<ShapeRendererProps> = ({
    shape,
    shapeUtil,
    isSelected,
}) => {
    if (!shapeUtil) {
        console.warn(`No ShapeUtil found for type: ${shape.type}`)
        return null
    }

    // 使用 ShapeUtil 渲染图形
    const shapeElement = shapeUtil.component(shape)

    return (
        <g
            data-shape-id={shape.id}
            data-shape-type={shape.type}
            className={isSelected ? 'shape-selected' : 'shape'}
            style={{
                pointerEvents: shape.isLocked ? 'none' : 'all',
            }}
        >
            {shapeElement}

            {/* 选中状态的高亮 */}
            {isSelected && (
                <use
                    href={`#${shape.id}`}
                    stroke="#1e90ff"
                    strokeWidth={2 / (shape.rotation || 1)}
                    fill="none"
                    pointerEvents="none"
                />
            )}
        </g>
    )
}
