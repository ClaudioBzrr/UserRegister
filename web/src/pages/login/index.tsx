import { useState, type FormEvent } from 'react'
import style from './index.module.css'
import Input from '../../components/ui/input'
import PasswordInput from '../../components/ui/password-input'
import { LucideUser } from 'lucide-react'
import Button from '../../components/ui/button'


export default function Login() {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')


    async function handleLogin(e: FormEvent) {
        e.preventDefault()
        try {
            const data = await fetch('http://localhost:3000/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
            if (data) {
                localStorage.setItem('user', JSON.stringify(data))
            }
        } catch (err) {
            throw new Error(`${err instanceof Error ? err.message : String(err)}`)
        }
    }

    return (
        <main className={style.container}>
            <form className={style.form} onSubmit={e => handleLogin(e)}>
                <Input type='email' required onChange={e => setEmail(e.target.value)} leftElement={<LucideUser />} />
                <PasswordInput required onChange={e => setPassword(e.target.value)} />
                <div className={style.buttonContainer}>
                    <Button type='submit' text='Entrar' />
                </div>
            </form>
        </main>
    )
}