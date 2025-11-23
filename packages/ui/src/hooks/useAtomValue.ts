import { useState, useEffect } from 'react'
import { Atom, react } from '@tsdraw/editor'

/**
 * 自定义 Hook：订阅 Atom 的值
 * 替代 @tldraw/state-react 的 useAtomValue
 */
export function useAtomValue<T>(atom: Atom<T>): T {
    // 初始化状态
    const [value, setValue] = useState(() => atom.get())

    useEffect(() => {
        // 使用 react 函数自动追踪依赖
        // 当 atom.get() 的值变化时，回调会被重新执行
        const stop = react('useAtomValue', () => {
            const newValue = atom.get()
            setValue(newValue)
        })

        return stop
    }, [atom])

    return value
}
