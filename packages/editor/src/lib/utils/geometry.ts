/**
 * 几何工具函数
 * 用于边界计算、碰撞检测等
 */

import { Box, Point, Vec } from '../types/base-types'

// ============================================================================
// 边界框操作
// ============================================================================

/**
 * 计算多个边界框的并集
 */
export function unionBoxes(boxes: Box[]): Box {
    if (boxes.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 }
    }

    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (const box of boxes) {
        minX = Math.min(minX, box.x)
        minY = Math.min(minY, box.y)
        maxX = Math.max(maxX, box.x + box.width)
        maxY = Math.max(maxY, box.y + box.height)
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    }
}

/**
 * 检查两个边界框是否相交
 */
export function boxesIntersect(a: Box, b: Box): boolean {
    return !(
        a.x + a.width < b.x ||
        b.x + b.width < a.x ||
        a.y + a.height < b.y ||
        b.y + b.height < a.y
    )
}

/**
 * 检查点是否在边界框内
 */
export function pointInBox(point: Point, box: Box): boolean {
    return (
        point.x >= box.x &&
        point.x <= box.x + box.width &&
        point.y >= box.y &&
        point.y <= box.y + box.height
    )
}

/**
 * 扩展边界框
 */
export function expandBox(box: Box, amount: number): Box {
    return {
        x: box.x - amount,
        y: box.y - amount,
        width: box.width + amount * 2,
        height: box.height + amount * 2,
    }
}

/**
 * 获取边界框的中心点
 */
export function getBoxCenter(box: Box): Point {
    return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
    }
}

// ============================================================================
// 点操作
// ============================================================================

/**
 * 计算两点之间的距离
 */
export function distance(a: Point, b: Point): number {
    const dx = b.x - a.x
    const dy = b.y - a.y
    return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 旋转点
 */
export function rotatePoint(point: Point, center: Point, angle: number): Point {
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
 * 线性插值
 */
export function lerpPoint(a: Point, b: Point, t: number): Point {
    return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
    }
}

// ============================================================================
// 向量操作
// ============================================================================

/**
 * 向量加法
 */
export function addVec(a: Vec, b: Vec): Vec {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: (a.z ?? 0) + (b.z ?? 0),
    }
}

/**
 * 向量减法
 */
export function subVec(a: Vec, b: Vec): Vec {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: (a.z ?? 0) - (b.z ?? 0),
    }
}

/**
 * 向量乘以标量
 */
export function mulVec(v: Vec, scalar: number): Vec {
    return {
        x: v.x * scalar,
        y: v.y * scalar,
        z: (v.z ?? 0) * scalar,
    }
}

/**
 * 向量长度
 */
export function vecLength(v: Vec): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + (v.z ?? 0) * (v.z ?? 0))
}

/**
 * 向量归一化
 */
export function normalizeVec(v: Vec): Vec {
    const len = vecLength(v)
    if (len === 0) return { x: 0, y: 0, z: 0 }

    return {
        x: v.x / len,
        y: v.y / len,
        z: (v.z ?? 0) / len,
    }
}

/**
 * 向量点积
 */
export function dotVec(a: Vec, b: Vec): number {
    return a.x * b.x + a.y * b.y + (a.z ?? 0) * (b.z ?? 0)
}

// ============================================================================
// 角度操作
// ============================================================================

/**
 * 角度转弧度
 */
export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * 弧度转角度
 */
export function radiansToDegrees(radians: number): number {
    return radians * (180 / Math.PI)
}

/**
 * 规范化角度到 [0, 2π)
 */
export function normalizeAngle(angle: number): number {
    while (angle < 0) angle += Math.PI * 2
    while (angle >= Math.PI * 2) angle -= Math.PI * 2
    return angle
}

// ============================================================================
// 碰撞检测
// ============================================================================

/**
 * 点到线段的距离
 */
export function distanceToLineSegment(
    point: Point,
    lineStart: Point,
    lineEnd: Point
): number {
    const dx = lineEnd.x - lineStart.x
    const dy = lineEnd.y - lineStart.y

    if (dx === 0 && dy === 0) {
        return distance(point, lineStart)
    }

    const t = Math.max(0, Math.min(1,
        ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (dx * dx + dy * dy)
    ))

    const projX = lineStart.x + t * dx
    const projY = lineStart.y + t * dy

    return distance(point, { x: projX, y: projY })
}

/**
 * 检查点是否在多边形内（射线法）
 */
export function pointInPolygon(point: Point, polygon: Point[]): boolean {
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

// ============================================================================
// 数学工具
// ============================================================================

/**
 * 限制数值范围
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
}

/**
 * 线性插值
 */
export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

/**
 * 检查两个数是否近似相等
 */
export function approximately(a: number, b: number, epsilon: number = 0.0001): boolean {
    return Math.abs(a - b) < epsilon
}
