import type { ReactNode } from 'react'
import style from './index.module.css'

interface IBadgeProps {
    children: ReactNode
    tone?: 'default' | 'success' | 'warning' | 'danger'
}

export default function Badge({ children, tone = 'default' }: IBadgeProps) {
    return <span className={[style.badge, style[tone]].filter(Boolean).join(' ')}>{children}</span>
}