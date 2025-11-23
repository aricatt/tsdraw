/**
 * 文本 ShapeUtil
 */

import React from 'react'
import { ShapeUtil, ResizeInfo } from './ShapeUtil'
import { TextShape, Box, Point } from '../types/base-types'

export class TextShapeUtil extends ShapeUtil<TextShape> {
    readonly type = 'text' as const

    // --------------------------------------------------------------------------
    // 默认属性
    // --------------------------------------------------------------------------

    getDefaultProps(): TextShape['props'] {
        return {
            text: '',
            fontSize: 16,
            fontFamily: 'sans-serif',
            color: '#1e1e1e',
            align: 'left',
            autoSize: true,
        }
    }

    // --------------------------------------------------------------------------
    // 边界计算
    // --------------------------------------------------------------------------

    getBounds(shape: TextShape): Box {
        const { x, y, props } = shape
        const { text, fontSize, fontFamily, autoSize } = props

        if (autoSize) {
            // 自动大小：根据文本内容计算
            const size = this.measureText(text, fontSize, fontFamily)
            return {
                x,
                y,
                width: size.width,
                height: size.height,
            }
        } else {
            // 固定大小：TODO - 需要存储宽度和高度
            return {
                x,
                y,
                width: 200, // 默认宽度
                height: fontSize * 1.5, // 默认高度
            }
        }
    }

    // --------------------------------------------------------------------------
    // 碰撞检测
    // --------------------------------------------------------------------------

    hitTest(shape: TextShape, point: Point): boolean {
        const bounds = this.getBounds(shape)

        return (
            point.x >= bounds.x &&
            point.x <= bounds.x + bounds.width &&
            point.y >= bounds.y &&
            point.y <= bounds.y + bounds.height
        )
    }

    // --------------------------------------------------------------------------
    // 渲染
    // --------------------------------------------------------------------------

    component(shape: TextShape): React.ReactNode {
        const { x, y, props, opacity, rotation } = shape
        const { text, fontSize, fontFamily, color, align } = props

        const transform = rotation !== 0
            ? `rotate(${rotation * (180 / Math.PI)} ${x} ${y})`
            : undefined

        return React.createElement('text', {
            x,
            y: y + fontSize, // 文本基线
            fontSize,
            fontFamily,
            fill: color,
            opacity,
            textAnchor: this.getTextAnchor(align),
            transform,
            style: {
                userSelect: 'none',
                pointerEvents: 'none',
            },
        }, text)
    }

    // --------------------------------------------------------------------------
    // 编辑支持
    // --------------------------------------------------------------------------

    canEdit(shape: TextShape): boolean {
        return true
    }

    onDoubleClick(shape: TextShape, event: React.MouseEvent): void {
        // 开始编辑文本
        this.editor.setEditingShapeId(shape.id)
    }

    onEditStart(shape: TextShape): void {
        // TODO: 显示文本编辑器
        console.log('Start editing text:', shape.id)
    }

    onEditEnd(shape: TextShape): void {
        // TODO: 隐藏文本编辑器
        console.log('End editing text:', shape.id)
    }

    // --------------------------------------------------------------------------
    // 调整大小
    // --------------------------------------------------------------------------

    canResize(shape: TextShape): boolean {
        return !shape.props.autoSize
    }

    onResize(shape: TextShape, info: ResizeInfo): Partial<TextShape> {
        // 文本不支持调整大小（除非是固定大小模式）
        return {
            x: info.bounds.x,
            y: info.bounds.y,
        }
    }

    // --------------------------------------------------------------------------
    // 辅助方法
    // --------------------------------------------------------------------------

    /**
     * 测量文本大小
     */
    private measureText(text: string, fontSize: number, fontFamily: string): { width: number; height: number } {
        // 创建临时 canvas 来测量文本
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            // 降级：使用估算
            return {
                width: text.length * fontSize * 0.6,
                height: fontSize * 1.2,
            }
        }

        ctx.font = `${fontSize}px ${fontFamily}`
        const metrics = ctx.measureText(text)

        return {
            width: metrics.width + 4, // 添加一些padding
            height: fontSize * 1.2,
        }
    }

    /**
     * 获取 SVG textAnchor 属性
     */
    private getTextAnchor(align: TextShape['props']['align']): string {
        switch (align) {
            case 'left':
                return 'start'
            case 'center':
                return 'middle'
            case 'right':
                return 'end'
            default:
                return 'start'
        }
    }

    /**
     * 更新文本内容
     */
    updateText(shape: TextShape, text: string): Partial<TextShape> {
        return {
            props: {
                ...shape.props,
                text,
            },
        }
    }

    /**
     * 设置文本对齐
     */
    setAlign(shape: TextShape, align: TextShape['props']['align']): Partial<TextShape> {
        return {
            props: {
                ...shape.props,
                align,
            },
        }
    }

    /**
     * 设置字体大小
     */
    setFontSize(shape: TextShape, fontSize: number): Partial<TextShape> {
        return {
            props: {
                ...shape.props,
                fontSize: Math.max(8, Math.min(200, fontSize)), // 限制范围
            },
        }
    }
}
