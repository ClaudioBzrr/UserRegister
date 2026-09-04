import { useId, type InputHTMLAttributes } from 'react'
import style from './index.module.css'


export interface IInput extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    leftElement?: React.JSX.Element
    rightElement?: React.JSX.Element
}

export default function Input({ label, error, leftElement, rightElement, className, ...props }: IInput) {
    const id = useId()
    return (
        <div className={style.field}>
            {label ? <label className={style.label} htmlFor={id}>{label}</label> : null}
            <div className={[style.container, error ? style.invalid : ''].filter(Boolean).join(' ')}>
                {leftElement ? <span className={style.icon} role='left element'>{leftElement}</span> : null}
                <input id={id} {...props} className={className} />
                {rightElement ? <span className={style.icon} role='right element'>{rightElement}</span> : null}
            </div>
            {error ? <p className={style.errorText} role='alert'>{error}</p> : null}
        </div>
    )
}