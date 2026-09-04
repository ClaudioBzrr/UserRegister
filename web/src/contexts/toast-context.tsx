import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import ToastItem, { type IToastData, type IToastTone } from '../components/ui/toast'
import style from '../components/ui/toast/index.module.css'

interface IToastContextData {
    toast: (message: string, tone?: IToastTone) => void
}

const ToastContext = createContext<IToastContextData>({} as IToastContextData)

const TOAST_DURATION = 3800

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<IToastData[]>([])
    const nextId = useRef(1)

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = useCallback((message: string, tone: IToastTone = 'success') => {
        const id = nextId.current++
        setToasts(prev => [...prev.slice(-3), { id, message, tone }])
        window.setTimeout(() => dismiss(id), TOAST_DURATION)
    }, [dismiss])

    const value = useMemo<IToastContextData>(() => ({ toast }), [toast])

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className={style.viewport} aria-live='polite'>
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onClose={dismiss} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): IToastContextData {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within a ToastProvider.')
    return context
}