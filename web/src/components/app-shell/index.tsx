import { useState } from 'react'
import { LucideMenu, LucideUsers, LucideLogOut, LucideShieldCheck, LucideX } from 'lucide-react'
import { NavLink, Outlet } from 'react-router'
import style from './index.module.css'
import Avatar from '../ui/avatar'
import { useAuth } from '../../contexts/auth-context'

const NAV_ITEMS = [
    { key: 'users', label: 'Users', path: '/users', icon: <LucideUsers /> },
]

function Brand() {
    return (
        <div className={style.brand}>
            <span className={style.logo}>
                <LucideShieldCheck />
            </span>
            <span className={style.brandText}>
                <strong>User Register</strong>
                <small>Management</small>
            </span>
        </div>
    )
}

export default function AppShell() {
    const { user, logout } = useAuth()
    const [open, setOpen] = useState(false)

    function closeDrawer() {
        setOpen(false)
    }

    return (
        <div className={style.shell}>
            <aside className={[style.sidebar, open ? style.open : ''].filter(Boolean).join(' ')}>
                <div className={style.sidebarHeader}>
                    <Brand />
                    <button type='button' className={style.mobileClose} onClick={closeDrawer} aria-label='Close menu'>
                        <LucideX />
                    </button>
                </div>

                <nav className={style.nav} aria-label='Main'>
                    <p className={style.navLabel}>Menu</p>
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.key}
                            to={item.path}
                            className={({ isActive }) =>
                                [style.navLink, isActive ? style.active : ''].filter(Boolean).join(' ')
                            }
                            onClick={closeDrawer}
                        >
                            <span className={style.navIcon}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className={style.sidebarFooter}>
                    <div className={style.userCard}>
                        <Avatar name={user?.name ?? '?'} size='sm' />
                        <div className={style.userInfo}>
                            <strong className={style.userName}>{user?.name}</strong>
                            <span className={style.userEmail}>{user?.email}</span>
                        </div>
                    </div>
                    <button type='button' className={style.logout} onClick={logout}>
                        <LucideLogOut />
                        Sign out
                    </button>
                </div>
            </aside>

            {open ? <div className={style.backdrop} onClick={closeDrawer} aria-hidden='true' /> : null}

            <div className={style.main}>
                <header className={style.topbar}>
                    <button type='button' className={style.burger} onClick={() => setOpen(true)} aria-label='Open menu'>
                        <LucideMenu />
                    </button>
                    <div className={style.topbarBrand}>
                        <Brand />
                    </div>
                    <div className={style.topbarUser}>
                        <Avatar name={user?.name ?? '?'} size='sm' />
                    </div>
                </header>

                <main className={style.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    )
}