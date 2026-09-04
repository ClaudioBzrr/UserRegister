import { useState } from 'react'
import Input, { type IInput } from '../input'
import style from './index.module.css'
import { LucideEye, LucideEyeClosed, LucideLock, LucideLockOpen } from 'lucide-react'

interface IPasswordInput extends IInput {}

export default function PasswordInput({ ...props }: IPasswordInput) {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    return (
        <Input
            leftElement={showPassword ? <LucideLockOpen /> : <LucideLock />}
            rightElement={
                <button
                    type='button'
                    className={style.showPassword}
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword ? <LucideEye /> : <LucideEyeClosed />}
                </button>
            }
            {...props}
            type={showPassword ? 'text' : 'password'}
        />
    )
}