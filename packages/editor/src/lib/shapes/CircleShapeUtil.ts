/**
 * 圆形 ShapeUtil
 */

import React from 'react'
import { ShapeUtil, ResizeInfo } from './ShapeUtil'
import { CircleShape, Box, Point } from '../types/base-types'

export class CircleShapeUtil extends ShapeUtil<CircleShape> {
    readonly type = 'circle' as const

    // --------------------------------------------------------------------------
    // 默认属性
    // --------------------------------------------------------------------------

    getDefaultProps(): CircleShape['props'] {
        return {
            radius: 50,
            fill: '#e3e3e3',
            stroke: '#1e1e1e',
            strokeWidth: 2,
        }
    }

    // --------------------------------------------------------------------------
    // 边界计算
    // --------------------------------------------------------------------------

    getBounds(shape: CircleShape): Box {
        const { x, y, props } = shape
        const { radius } = props

        return {
            x: x - radius,
            y: y - radius,
            width: radius * 2,
            height: radius * 2,
        }
    }

    // --------------------------------------------------------------------------
    // 碰撞检测
    // --------------------------------------------------------------------------

    hitTest(shape: CircleShape, point: Point): boolean {
        const { x, y, props } = shape
        const { radius } = props

        // 计算点到圆心的距离
        const dx = point.x - x
        const dy = point.y - y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // 如果距离小于半径，则命中
        return distance <= radius
    }

    // --------------------------------------------------------------------------
    // 渲染
    // --------------------------------------------------------------------------

    component(shape: CircleShape): React.ReactNode {
        const { x, y, props, opacity, rotation } = shape
        const { radius, fill, stroke, strokeWidth } = props

        return React.createElement('circle', {
            cx: x,
            cy: y,
            r: radius,
            fill,
            stroke,
            strokeWidth,
            opacity,
            transform: rotation !== 0 ? `rotate(${rotation * (180 / Math.PI)} ${x} ${y})` : undefined,
        })
    }

    // --------------------------------------------------------------------------
    // 调整大小
    // --------------------------------------------------------------------------

    onResize(shape: CircleShape, info: ResizeInfo): Partial<CircleShape> {
        const { bounds, isAspectRatioLocked } = info

        // 圆形总是保持纵横比
        const newRadius = Math.min(bounds.width, bounds.height) / 2

        return {
            x: bounds.x + bounds.width / 2,
            y: bounds.y + bounds.height / 2,
            props: {
                ...shape.props,
                radius: newRadius,
            },
        }
    }

    // --------------------------------------------------------------------------
    // 辅助方法
    // --------------------------------------------------------------------------

    /**
     * 获取圆周上的点
     */
    getPointOnCircle(shape: CircleShape, angle: number): Point {
        const { x, y, props } = shape
        const { radius } = props

        return {
            x: x + radius * Math.cos(angle),
            y: y + radius * Math.sin(angle),
        }
    }

    /**
     * 检查两个圆是否相交
     */
    intersectsCircle(shape1: CircleShape, shape2: CircleShape): boolean {
        const dx = shape2.x - shape1.x
        const dy = shape2.y - shape1.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const radiusSum = shape1.props.radius + shape2.props.radius

        return distance <= radiusSum
    }
}
