import type { ButtonHTMLAttributes, JSX } from "react";
import style from './index.module.css'

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string
    icon?: JSX.Element
}

export function Button({ title, ...props }: IButtonProps) {
    return (
        <button className={style.button} {...props}>
            {title}
        </button>
    )
}