/**
 * Toolbar - 工具栏组件
 */

import React from 'react'
import { Editor } from '@tsdraw/editor'
import { useAtomValue } from '../hooks/useAtomValue'
import './Toolbar.css'

export interface ToolbarProps {
    editor: Editor
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
    const currentToolId = useAtomValue(editor.currentToolIdAtom)
    const camera = useAtomValue(editor.cameraAtom)

    const tools = [
        { id: 'select', icon: '⬆️', label: '选择' },
        { id: 'draw', icon: '✏️', label: '绘制' },
        { id: 'circle', icon: '⭕', label: '圆形' },
        { id: 'rect', icon: '⬜', label: '矩形' },
        { id: 'text', icon: '📝', label: '文本' },
        { id: 'hand', icon: '✋', label: '平移' },
    ]

    return (
        <div className="tsdraw-toolbar">
            {/* 工具按钮 */}
            <div className="toolbar-section">
                {tools.map(tool => (
                    <button
                        key={tool.id}
                        className={`toolbar-button ${currentToolId === tool.id ? 'active' : ''}`}
                        onClick={() => editor.setCurrentTool(tool.id)}
                        title={tool.label}
                    >
                        <span className="tool-icon">{tool.icon}</span>
                        <span className="tool-label">{tool.label}</span>
                    </button>
                ))}
            </div>

            {/* 分隔符 */}
            <div className="toolbar-divider" />

            {/* 缩放控制 */}
            <div className="toolbar-section">
                <button
                    className="toolbar-button"
                    onClick={() => editor.zoomOut()}
                    title="缩小"
                >
                    <span className="tool-icon">🔍-</span>
                </button>

                <span className="zoom-level">
                    {Math.round(camera.z * 100)}%
                </span>

                <button
                    className="toolbar-button"
                    onClick={() => editor.zoomIn()}
                    title="放大"
                >
                    <span className="tool-icon">🔍+</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={() => editor.resetCamera()}
                    title="重置视图"
                >
                    <span className="tool-icon">🎯</span>
                </button>
            </div>

            {/* 分隔符 */}
            <div className="toolbar-divider" />

            {/* 操作按钮 */}
            <div className="toolbar-section">
                <button
                    className="toolbar-button"
                    onClick={() => editor.undo()}
                    title="撤销"
                >
                    <span className="tool-icon">↩️</span>
                </button>

                <button
                    className="toolbar-button"
                    onClick={() => editor.redo()}
                    title="重做"
                >
                    <span className="tool-icon">↪️</span>
                </button>
            </div>
        </div>
    )
}
