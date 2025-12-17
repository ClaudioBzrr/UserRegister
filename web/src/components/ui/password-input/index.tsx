import { useState, type InputHTMLAttributes } from 'react'
import style from './index.module.css'
import { Eye, EyeClosed } from 'lucide-react'

interface IPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> { }

export default function PasswordInput({ ...props }: IPasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false)
    return (
        <div className={style.container}>
            <input className={style['input-custom']} {...props} type={isVisible == true ? 'text' : 'password'} />
            {
                isVisible ? <Eye onClick={() => setIsVisible(false)} className={style.icon} /> : <EyeClosed onClick={() => setIsVisible(true)} className={style.icon} />
            }
        </div>
    )
}