import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { LucideLock, LucideMail, LucideShieldCheck, LucideUserPlus, LucideUsers } from 'lucide-react'
import style from './index.module.css'
import Input from '../../components/ui/input'
import PasswordInput from '../../components/ui/password-input'
import Button from '../../components/ui/button'
import { useAuth } from '../../contexts/auth-context'

export default function Login() {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState<boolean>(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleLogin(e: FormEvent) {
        e.preventDefault()
        setError(null)
        setSubmitting(true)
        try {
            await login({ email, password })
            navigate('/users', { replace: true })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className={style.page}>
            <section className={style.panel}>
                <div className={style.panelInner}>
                    <div className={style.brand}>
                        <span className={style.logo}>
                            <LucideShieldCheck />
                        </span>
                        <span className={style.brandText}>
                            <strong>User Register</strong>
                            <small>Management</small>
                        </span>
                    </div>

                    <div className={style.panelCopy}>
                        <h1 className={style.panelTitle}>Manage your users in one place.</h1>
                        <p className={style.panelSubtitle}>
                            A clean, modern platform to register, organize and manage your accounts with total control.
                        </p>
                    </div>

                    <ul className={style.features}>
                        <li>
                            <span className={style.featureIcon}>
                                <LucideUsers />
                            </span>
                            <div>
                                <strong>User management</strong>
                                <small>Create, edit and delete accounts</small>
                            </div>
                        </li>
                        <li>
                            <span className={style.featureIcon}>
                                <LucideLock />
                            </span>
                            <div>
                                <strong>Secure by default</strong>
                                <small>Passwords hashed with bcrypt</small>
                            </div>
                        </li>
                        <li>
                            <span className={style.featureIcon}>
                                <LucideUserPlus />
                            </span>
                            <div>
                                <strong>Instant sign-up</strong>
                                <small>Register new users in seconds</small>
                            </div>
                        </li>
                    </ul>
                </div>
            </section>

            <section className={style.formArea}>
                <form className={style.form} onSubmit={e => handleLogin(e)} noValidate>
                    <div className={style.formHeader}>
                        <h2 className={style.formTitle}>Welcome back</h2>
                        <p className={style.formSubtitle}>Sign in to your account to continue.</p>
                    </div>

                    <Input
                        label='Email'
                        type='email'
                        required
                        placeholder='you@example.com'
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        leftElement={<LucideMail />}
                        autoComplete='email'
                    />
                    <PasswordInput
                        label='Password'
                        required
                        placeholder='Your password'
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete='current-password'
                    />

                    {error ? (
                        <div className={style.errorBanner} role='alert'>
                            {error}
                        </div>
                    ) : null}

                    <Button
                        type='submit'
                        text={submitting ? 'Signing in...' : 'Sign in'}
                        loading={submitting}
                        fullWidth
                    />

                    <p className={style.formFooter}>
                        New here? Ask an existing user to create your account on the Users page.
                    </p>
                </form>
            </section>
        </main>
    )
}