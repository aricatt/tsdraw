/**
 * 手绘 ShapeUtil
 */

import React from 'react'
import { ShapeUtil, ResizeInfo } from './ShapeUtil'
import { DrawShape, Box, Point } from '../types/base-types'

export class DrawShapeUtil extends ShapeUtil<DrawShape> {
    readonly type = 'draw' as const

    // --------------------------------------------------------------------------
    // 默认属性
    // --------------------------------------------------------------------------

    getDefaultProps(): DrawShape['props'] {
        return {
            points: [],
            color: '#1e1e1e',
            size: 2,
            isClosed: false,
        }
    }

    // --------------------------------------------------------------------------
    // 边界计算
    // --------------------------------------------------------------------------

    getBounds(shape: DrawShape): Box {
        const { props } = shape
        const { points } = props

        if (points.length === 0) {
            return { x: 0, y: 0, width: 0, height: 0 }
        }

        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        for (const point of points) {
            minX = Math.min(minX, point.x)
            minY = Math.min(minY, point.y)
            maxX = Math.max(maxX, point.x)
            maxY = Math.max(maxY, point.y)
        }

        // 添加线宽的一半作为padding
        const padding = props.size / 2

        return {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + padding * 2,
            height: maxY - minY + padding * 2,
        }
    }

    // --------------------------------------------------------------------------
    // 碰撞检测
    // --------------------------------------------------------------------------

    hitTest(shape: DrawShape, point: Point): boolean {
        const { props } = shape
        const { points, size, isClosed } = props

        if (points.length === 0) return false

        // 如果是闭合路径，检查点是否在多边形内
        if (isClosed) {
            return this.isPointInPolygon(point, points)
        }

        // 否则检查点是否在线段附近
        const threshold = size + 2 // 增加一些容差

        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i]
            const p2 = points[i + 1]

            if (this.distanceToLineSegment(point, p1, p2) <= threshold) {
                return true
            }
        }

        return false
    }

    // --------------------------------------------------------------------------
    // 渲染
    // --------------------------------------------------------------------------

    component(shape: DrawShape): React.ReactNode {
        const { props, opacity } = shape
        const { points, color, size, isClosed } = props

        if (points.length === 0) return null

        // 构建 SVG 路径
        const pathData = this.getPathData(points, isClosed)

        return React.createElement('path', {
            d: pathData,
            stroke: color,
            strokeWidth: size,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            fill: isClosed ? color : 'none',
            fillOpacity: isClosed ? 0.1 : 0,
            opacity,
        })
    }

    // --------------------------------------------------------------------------
    // 调整大小
    // --------------------------------------------------------------------------

    canResize(shape: DrawShape): boolean {
        return false // 手绘图形不支持调整大小
    }

    canRotate(shape: DrawShape): boolean {
        return false // 手绘图形不支持旋转
    }

    // --------------------------------------------------------------------------
    // 辅助方法
    // --------------------------------------------------------------------------

    /**
     * 生成 SVG 路径数据
     */
    private getPathData(points: Point[], isClosed: boolean): string {
        if (points.length === 0) return ''

        let path = `M ${points[0].x} ${points[0].y}`

        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`
        }

        if (isClosed) {
            path += ' Z'
        }

        return path
    }

    /**
     * 计算点到线段的距离
     */
    private distanceToLineSegment(point: Point, lineStart: Point, lineEnd: Point): number {
        const dx = lineEnd.x - lineStart.x
        const dy = lineEnd.y - lineStart.y

        if (dx === 0 && dy === 0) {
            // 线段退化为点
            const pdx = point.x - lineStart.x
            const pdy = point.y - lineStart.y
            return Math.sqrt(pdx * pdx + pdy * pdy)
        }

        // 计算投影参数 t
        const t = Math.max(0, Math.min(1,
            ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)
        ))

        // 计算投影点
        const projX = lineStart.x + t * dx
        const projY = lineStart.y + t * dy

        // 计算距离
        const pdx = point.x - projX
        const pdy = point.y - projY
        return Math.sqrt(pdx * pdx + pdy * pdy)
    }

    /**
     * 检查点是否在多边形内（射线法）
     */
    private isPointInPolygon(point: Point, polygon: Point[]): boolean {
        let inside = false

        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x
            const yi = polygon[i].y
            const xj = polygon[j].x
            const yj = polygon[j].y

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)

            if (intersect) inside = !inside
        }

        return inside
    }

    /**
     * 简化路径（减少点数）
     */
    simplifyPath(points: Point[], tolerance: number = 2): Point[] {
        if (points.length <= 2) return points

        // 使用 Ramer-Douglas-Peucker 算法
        return this.rdpSimplify(points, tolerance)
    }

    /**
     * RDP 简化算法
     */
    private rdpSimplify(points: Point[], tolerance: number): Point[] {
        if (points.length <= 2) return points

        // 找到距离最远的点
        let maxDistance = 0
        let maxIndex = 0
        const start = points[0]
        const end = points[points.length - 1]

        for (let i = 1; i < points.length - 1; i++) {
            const distance = this.distanceToLineSegment(points[i], start, end)
            if (distance > maxDistance) {
                maxDistance = distance
                maxIndex = i
            }
        }

        // 如果最大距离大于容差，递归简化
        if (maxDistance > tolerance) {
            const left = this.rdpSimplify(points.slice(0, maxIndex + 1), tolerance)
            const right = this.rdpSimplify(points.slice(maxIndex), tolerance)

            return [...left.slice(0, -1), ...right]
        }

        // 否则返回起点和终点
        return [start, end]
    }

    /**
     * 平滑路径
     */
    smoothPath(points: Point[], smoothing: number = 0.5): Point[] {
        if (points.length <= 2) return points

        const smoothed: Point[] = [points[0]]

        for (let i = 1; i < points.length - 1; i++) {
            const prev = points[i - 1]
            const curr = points[i]
            const next = points[i + 1]

            smoothed.push({
                x: curr.x * (1 - smoothing) + (prev.x + next.x) / 2 * smoothing,
                y: curr.y * (1 - smoothing) + (prev.y + next.y) / 2 * smoothing,
            })
        }

        smoothed.push(points[points.length - 1])

        return smoothed
    }
}
