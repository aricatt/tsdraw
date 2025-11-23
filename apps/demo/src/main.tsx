import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { Editor, createDefaultShapeUtils, Store } from '@tsdraw/editor'
import './index.css'

// 第一步：测试 Editor 初始化
function TestEditor() {
    const [status, setStatus] = useState('Initializing...')
    const [editor, setEditor] = useState<Editor | null>(null)

    useEffect(() => {
        try {
            setStatus('Creating Store...')
            const store = new Store({ schema: {} } as any)

            setStatus('Creating Editor...')
            const newEditor = new Editor({ store, autoFocus: true })

            setStatus('Creating ShapeUtils...')
            const shapeUtils = createDefaultShapeUtils(newEditor)

            setStatus('Creating shapes...')
            // 创建一个圆形测试
            newEditor.createShape('circle', {
                radius: 50,
                fill: '#ff6b6b',
                stroke: '#c92a2a',
                strokeWidth: 2,
            }, {
                x: 200,
                y: 200,
            })

            setEditor(newEditor)
            setStatus('✅ Editor initialized successfully!')
        } catch (error) {
            setStatus(`❌ Error: ${error instanceof Error ? error.message : String(error)}`)
            console.error('Editor initialization error:', error)
        }
    }, [])

    return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#1e90ff' }}>TSDraw Editor Test</h1>
            <p><strong>Status:</strong> {status}</p>

            {editor && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
                    <h3>Editor Info:</h3>
                    <p>Editor ID: {editor.id}</p>
                    <p>Current Page ID: {editor.currentPageId}</p>
                    <p>Camera: x={editor.camera.x}, y={editor.camera.y}, z={editor.camera.z}</p>
                    <p>Shapes count: {editor.currentPageShapes.get().length}</p>
                </div>
            )}
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <TestEditor />
    </React.StrictMode>,
)
