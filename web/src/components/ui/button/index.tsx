import type { ButtonHTMLAttributes } from 'react'
import style from './index.module.css'


interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
    leftElement?: React.JSX.Element
    rightElement?: React.JSX.Element
    text?: string
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md'
    fullWidth?: boolean
    loading?: boolean
}

export default function Button({
    text,
    leftElement,
    rightElement,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    className,
    disabled,
    children,
    ...props
}: IButton) {
    const classes = [
        style.base,
        style[variant],
        style[size],
        fullWidth ? style.fullWidth : '',
        loading ? style.loading : '',
        className ?? '',
    ].filter(Boolean).join(' ')

    return (
        <button {...props} className={classes} disabled={disabled || loading}>
            {loading ? <span className={style.spinner} aria-hidden='true' /> : null}
            {!loading && leftElement ? <span className={style.icon}>{leftElement}</span> : null}
            {text}
            {!loading && rightElement ? <span className={style.icon}>{rightElement}</span> : null}
        </button>
    )
}