import type { ReactNode } from 'react'
import style from './index.module.css'

interface IStatCardProps {
    label: string
    value: ReactNode
    icon?: ReactNode
    tone?: 'primary' | 'success' | 'warning' | 'danger'
}

export default function StatCard({ label, value, icon, tone = 'primary' }: IStatCardProps) {
    return (
        <div className={style.card}>
            {icon ? <div className={[style.icon, style[tone]].filter(Boolean).join(' ')}>{icon}</div> : null}
            <div className={style.text}>
                <span className={style.value}>{value}</span>
                <span className={style.label}>{label}</span>
            </div>
        </div>
    )
}