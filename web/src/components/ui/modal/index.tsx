import { LucideX } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import style from './index.module.css'

interface IModalProps {
    title?: string
    open: boolean
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
}

export default function Modal({ title, open, onClose, children, footer }: IModalProps) {
    useEffect(() => {
        if (!open) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKey)
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className={style.overlay} onClick={onClose} role='presentation'>
            <div
                className={style.modal}
                onClick={e => e.stopPropagation()}
                role='dialog'
                aria-modal='true'
                aria-label={title}
            >
                <div className={style.header}>
                    {title ? <h2 className={style.title}>{title}</h2> : <span />}
                    <button type='button' className={style.close} onClick={onClose} aria-label='Close modal'>
                        <LucideX />
                    </button>
                </div>
                <div className={style.body}>{children}</div>
                {footer ? <div className={style.footer}>{footer}</div> : null}
            </div>
        </div>
    )
}