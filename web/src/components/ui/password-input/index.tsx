import { useState } from 'react'
import Input, { type IInput } from '../input'
import style from './index.module.css'
import { LucideEye, LucideEyeClosed, LucideEyeOff, LucideLock, LucideLockOpen } from 'lucide-react'

interface IPasswordInput extends IInput {

}

export default function PasswordInput({ ...props }: IPasswordInput) {
    const [showPassword, setShowPassword] = useState<boolean>(false)
    return (
        <Input
            leftElement={showPassword ? <LucideLockOpen /> : <LucideLock />}
            rightElement={
                <span onClick={() => setShowPassword(!showPassword)} className={style.showPassword}>
                    {
                        showPassword ? <LucideEye /> : <LucideEyeClosed />
                    }
                </span>
            }
            {...props}
            type={showPassword ? 'text' : 'password'}
        />
    )
}