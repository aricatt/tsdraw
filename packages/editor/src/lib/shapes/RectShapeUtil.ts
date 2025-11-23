/**
 * 矩形 ShapeUtil
 */

import React from 'react'
import { ShapeUtil, ResizeInfo } from './ShapeUtil'
import { RectShape, Box, Point } from '../types/base-types'

export class RectShapeUtil extends ShapeUtil<RectShape> {
    readonly type = 'rect' as const

    // --------------------------------------------------------------------------
    // 默认属性
    // --------------------------------------------------------------------------

    getDefaultProps(): RectShape['props'] {
        return {
            width: 100,
            height: 100,
            fill: '#e3e3e3',
            stroke: '#1e1e1e',
            strokeWidth: 2,
            cornerRadius: 0,
        }
    }

    // --------------------------------------------------------------------------
    // 边界计算
    // --------------------------------------------------------------------------

    getBounds(shape: RectShape): Box {
        const { x, y, props } = shape
        const { width, height } = props

        return {
            x,
            y,
            width,
            height,
        }
    }

    // --------------------------------------------------------------------------
    // 碰撞检测
    // --------------------------------------------------------------------------

    hitTest(shape: RectShape, point: Point): boolean {
        const { x, y, props, rotation } = shape
        const { width, height } = props

        // 如果没有旋转，简单的矩形检测
        if (rotation === 0) {
            return (
                point.x >= x &&
                point.x <= x + width &&
                point.y >= y &&
                point.y <= y + height
            )
        }

        // 如果有旋转，需要将点转换到矩形的本地坐标系
        const localPoint = this.toLocalPoint(shape, point)

        return (
            localPoint.x >= 0 &&
            localPoint.x <= width &&
            localPoint.y >= 0 &&
            localPoint.y <= height
        )
    }

    // --------------------------------------------------------------------------
    // 渲染
    // --------------------------------------------------------------------------

    component(shape: RectShape): React.ReactNode {
        const { x, y, props, opacity, rotation } = shape
        const { width, height, fill, stroke, strokeWidth, cornerRadius } = props

        const transform = rotation !== 0
            ? `rotate(${rotation * (180 / Math.PI)} ${x + width / 2} ${y + height / 2})`
            : undefined

        return React.createElement('rect', {
            x,
            y,
            width,
            height,
            rx: cornerRadius,
            ry: cornerRadius,
            fill,
            stroke,
            strokeWidth,
            opacity,
            transform,
        })
    }

    // --------------------------------------------------------------------------
    // 调整大小
    // --------------------------------------------------------------------------

    onResize(shape: RectShape, info: ResizeInfo): Partial<RectShape> {
        const { bounds, isAspectRatioLocked, scaleX, scaleY } = info

        let newWidth = bounds.width
        let newHeight = bounds.height

        // 如果锁定纵横比
        if (isAspectRatioLocked) {
            const aspectRatio = shape.props.width / shape.props.height
            if (Math.abs(scaleX) > Math.abs(scaleY)) {
                newHeight = newWidth / aspectRatio
            } else {
                newWidth = newHeight * aspectRatio
            }
        }

        return {
            x: bounds.x,
            y: bounds.y,
            props: {
                ...shape.props,
                width: Math.max(1, newWidth),
                height: Math.max(1, newHeight),
            },
        }
    }

    // --------------------------------------------------------------------------
    // 辅助方法
    // --------------------------------------------------------------------------

    /**
     * 将世界坐标转换为矩形的本地坐标
     */
    private toLocalPoint(shape: RectShape, point: Point): Point {
        const { x, y, props, rotation } = shape
        const { width, height } = props

        // 矩形中心点
        const cx = x + width / 2
        const cy = y + height / 2

        // 将点平移到原点
        const dx = point.x - cx
        const dy = point.y - cy

        // 反向旋转
        const cos = Math.cos(-rotation)
        const sin = Math.sin(-rotation)

        const rotatedX = dx * cos - dy * sin
        const rotatedY = dx * sin + dy * cos

        // 转换回矩形坐标系
        return {
            x: rotatedX + width / 2,
            y: rotatedY + height / 2,
        }
    }

    /**
     * 获取矩形的四个角点
     */
    getCorners(shape: RectShape): Point[] {
        const { x, y, props, rotation } = shape
        const { width, height } = props

        const corners: Point[] = [
            { x, y },                      // 左上
            { x: x + width, y },           // 右上
            { x: x + width, y: y + height }, // 右下
            { x, y: y + height },          // 左下
        ]

        // 如果有旋转，旋转所有角点
        if (rotation !== 0) {
            const cx = x + width / 2
            const cy = y + height / 2

            return corners.map(corner => this.rotatePoint(corner, { x: cx, y: cy }, rotation))
        }

        return corners
    }

    /**
     * 旋转点
     */
    private rotatePoint(point: Point, center: Point, angle: number): Point {
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const dx = point.x - center.x
        const dy = point.y - center.y

        return {
            x: center.x + dx * cos - dy * sin,
            y: center.y + dx * sin + dy * cos,
        }
    }

    /**
     * 检查两个矩形是否相交
     */
    intersectsRect(shape1: RectShape, shape2: RectShape): boolean {
        // 简单的 AABB 检测（假设没有旋转）
        if (shape1.rotation === 0 && shape2.rotation === 0) {
            const bounds1 = this.getBounds(shape1)
            const bounds2 = this.getBounds(shape2)

            return !(
                bounds1.x + bounds1.width < bounds2.x ||
                bounds2.x + bounds2.width < bounds1.x ||
                bounds1.y + bounds1.height < bounds2.y ||
                bounds2.y + bounds2.height < bounds1.y
            )
        }

        // TODO: 实现旋转矩形的相交检测（SAT 算法）
        return false
    }
}
