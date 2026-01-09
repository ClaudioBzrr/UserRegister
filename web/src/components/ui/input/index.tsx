import type { InputHTMLAttributes } from 'react'
import style from './index.module.css'


export interface IInput extends InputHTMLAttributes<HTMLInputElement> {
    leftElement?: React.JSX.Element
    rightElement?: React.JSX.Element
}

export default function Input({ leftElement, rightElement, ...props }: IInput) {
    return (
        <div className={style.container}>
            {
                leftElement ? <span className={style.icon} role='left element'>{leftElement}</span> : null
            }
            <input {...props} />
            {
                rightElement ? <span className={style.icon} role='right element'>{rightElement}</span> : null
            }
        </div>
    )
}