import type { InputHTMLAttributes } from 'react'
import style from './index.module.css'


interface IInpuProps extends InputHTMLAttributes<HTMLInputElement> {

}

export function Input() {
    return <input />
}