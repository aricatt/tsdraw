/**
 * CanvasBackground - 画布背景（网格）
 */

import React from 'react'

export interface CanvasBackgroundProps {
    camera: { x: number; y: number; z: number }
    gridSize?: number
    gridColor?: string
}

export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
    camera,
    gridSize = 20,
    gridColor = '#e0e0e0',
}) => {
    const { x, y, z } = camera

    // 计算网格的偏移
    const offsetX = x % (gridSize * z)
    const offsetY = y % (gridSize * z)

    return (
        <defs>
            <pattern
                id="grid"
                width={gridSize * z}
                height={gridSize * z}
                patternUnits="userSpaceOnUse"
                x={offsetX}
                y={offsetY}
            >
                <path
                    d={`M ${gridSize * z} 0 L 0 0 0 ${gridSize * z}`}
                    fill="none"
                    stroke={gridColor}
                    strokeWidth={0.5}
                />
            </pattern>

            <rect width="100%" height="100%" fill="url(#grid)" />
        </defs>
    )
}
