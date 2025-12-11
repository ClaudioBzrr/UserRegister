import type { ButtonHTMLAttributes } from "react";
import style from './index.module.css'

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    title: string
}

export function Button({ title, ...props }: IButtonProps) {
    return <button className="" {...props}>{title}</button>;
}