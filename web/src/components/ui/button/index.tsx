import type { ButtonHTMLAttributes } from 'react'
import style from './index.module.css'


interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
    leftElement?: React.JSX.Element
    rightElement?: React.JSX.Element
    text?: string
}

export default function Button({ text, leftElement, rightElement, ...props }: IButton) {
    return (
        <button {...props}>
            {leftElement ? <span className={style.icon}>{leftElement}</span> : null}
            {text}
            {rightElement ? <span className={style.icon}>{rightElement}</span> : null}
        </button>
    )
}