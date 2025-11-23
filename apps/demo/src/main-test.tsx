import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>TSDraw Demo - Testing</h1>
            <p>If you can see this, React is working!</p>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
