import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import PasswordInput from '../../components/ui/password-input'
import style from './index.module.css'


export default function Login() {
    return (
        <div className={style.background}>
            <div className={style['login-box']}>
                <div className={style['login-container']}>
                    <Input placeholder='Usuário' />
                    <PasswordInput placeholder='Senha' />
                    <Button title='Login' />
                </div>
            </div>
        </div>
    )
}