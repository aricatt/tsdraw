/**
 * TSDraw - 主组件
 * 
 * 这是用户使用的主要组件，包含：
 * - Canvas（画布）
 * - Toolbar（工具栏）
 * - 所有必要的状态管理
 */

import React, { useEffect, useState } from 'react'
import { Editor, createDefaultShapeUtils, ShapeUtilRegistry, createDefaultSchema } from '@tsdraw/editor'
import { Store } from '@tldraw/store'
import { Canvas } from './components/Canvas'
import { Toolbar } from './components/Toolbar'
import './TSDraw.css'

// ============================================================================
// TSDraw Props
// ============================================================================

export interface TSDrawProps {
    /** 初始数据 */
    initialData?: any

    /** 画布宽度 */
    width?: number

    /** 画布高度 */
    height?: number

    /** 是否显示网格 */
    showGrid?: boolean

    /** 是否显示工具栏 */
    showToolbar?: boolean

    /** 自定义类名 */
    className?: string

    /** 编辑器初始化回调 */
    onEditorInit?: (editor: Editor) => void

    /** 数据变化回调 */
    onChange?: (data: any) => void
}

// ============================================================================
// TSDraw Component
// ============================================================================

export const TSDraw: React.FC<TSDrawProps> = ({
    initialData,
    width = 1920,
    height = 1080,
    showGrid = true,
    showToolbar = true,
    className,
    onChange,
    onEditorInit,
}) => {
    const [editor, setEditor] = useState<Editor | null>(null)
    const [shapeUtils, setShapeUtils] = useState<ShapeUtilRegistry | null>(null)

    // 初始化编辑器
    useEffect(() => {
        // 创建 Store
        const store = new Store({
            schema: createDefaultSchema(),
        })

        // 创建 Editor
        const newEditor = new Editor({
            store,
            autoFocus: true,
        })

        // 创建 ShapeUtils
        const utils = createDefaultShapeUtils(newEditor)


        setEditor(newEditor)
        setShapeUtils(utils)

        // 调用初始化回调
        if (onEditorInit) {
            onEditorInit(newEditor)
        }

        // 清理
        return () => {
            // TODO: 清理资源
        }
    }, [onEditorInit])

    // 监听数据变化
    useEffect(() => {
        if (!editor || !onChange) return

        // TODO: 订阅 store 变化
        // const unsubscribe = editor.store.listen(() => {
        //   onChange(editor.store.serialize())
        // })

        // return unsubscribe
    }, [editor, onChange])

    if (!editor || !shapeUtils) {
        return <div className="tsdraw-loading">Loading...</div>
    }

    return (
        <div className={`tsdraw ${className || ''}`}>
            {/* 工具栏 */}
            {showToolbar && (
                <Toolbar editor={editor} />
            )}

            {/* 画布 */}
            <Canvas
                editor={editor}
                shapeUtils={shapeUtils}
                width={width}
                height={height}
                showGrid={showGrid}
            />
        </div>
    )
}
