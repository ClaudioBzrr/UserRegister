import { useState, type InputHTMLAttributes } from 'react'
import style from './index.module.css'
import { LuEye, LuEyeClosed } from 'react-icons/lu'

interface IPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> { }

export default function PasswordInput({ ...props }: IPasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false)
    return (
        <div className={style.container}>
            <input className={style['input-custom']} {...props} type={isVisible == true ? 'text' : 'password'} />
            {
                isVisible ? <LuEye onClick={() => setIsVisible(false)} className={style.icon} /> : <LuEyeClosed onClick={() => setIsVisible(true)} className={style.icon} />
            }
        </div>
    )
}