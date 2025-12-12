import type { InputHTMLAttributes } from 'react'
import style from './index.module.css'


interface IInpuProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export function Input({ label, ...props }: IInpuProps) {
    return (
        <div className={style.container}>
            {
                label ? (
                    <label>{label}</label>
                ) : (
                    null
                )
            }
            <input className={style.input} {...props} />
        </div>
    )
}