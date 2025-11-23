import React, { useEffect, useRef } from 'react'
import { TSDraw } from '@tsdraw/ui'
import { Editor } from '@tsdraw/editor'

function App() {
    const editorRef = useRef<Editor | null>(null)

    // 演示：创建一些初始图形
    const handleEditorInit = (editor: Editor) => {
        editorRef.current = editor

        // 创建一个圆形
        editor.createShape('circle', {
            radius: 50,
            fill: '#ff6b6b',
            stroke: '#c92a2a',
            strokeWidth: 2,
        }, {
            x: 200,
            y: 200,
        })

        // 创建一个矩形
        editor.createShape('rect', {
            width: 100,
            height: 80,
            fill: '#4dabf7',
            stroke: '#1971c2',
            strokeWidth: 2,
            cornerRadius: 8,
        }, {
            x: 400,
            y: 200,
        })

        // 创建一个文本
        editor.createShape('text', {
            text: 'Hello TSDraw!',
            fontSize: 24,
            fontFamily: 'sans-serif',
            color: '#2f9e44',
            align: 'center',
        }, {
            x: 200,
            y: 400,
        })

        // 创建一个手绘路径
        editor.createShape('draw', {
            points: [
                { x: 600, y: 200 },
                { x: 620, y: 220 },
                { x: 640, y: 210 },
                { x: 660, y: 230 },
                { x: 680, y: 220 },
                { x: 700, y: 240 },
            ],
            color: '#f59f00',
            size: 3,
            isClosed: false,
        }, {
            x: 0,
            y: 0,
        })

        console.log('初始图形已创建')
    }

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <TSDraw
                width={1920}
                height={1080}
                showGrid={true}
                showToolbar={true}
                onEditorInit={handleEditorInit}
                onChange={(data) => {
                    console.log('Data changed:', data)
                }}
            />
        </div>
    )
}

export default App
