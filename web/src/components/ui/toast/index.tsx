import { LucideCheckCircle2, LucideInfo, LucideX, LucideXCircle } from 'lucide-react'
import style from './index.module.css'

export type IToastTone = 'success' | 'error' | 'info'

export interface IToastData {
    id: number
    message: string
    tone: IToastTone
}

const ICONS: Record<IToastTone, React.JSX.Element> = {
    success: <LucideCheckCircle2 />,
    error: <LucideXCircle />,
    info: <LucideInfo />,
}

interface IToastItemProps {
    toast: IToastData
    onClose: (id: number) => void
}

export default function ToastItem({ toast, onClose }: IToastItemProps) {
    return (
        <div className={[style.toast, style[toast.tone]].filter(Boolean).join(' ')} role='status'>
            <span className={style.icon}>{ICONS[toast.tone]}</span>
            <p className={style.message}>{toast.message}</p>
            <button
                type='button'
                className={style.close}
                onClick={() => onClose(toast.id)}
                aria-label='Dismiss notification'
            >
                <LucideX />
            </button>
        </div>
    )
}