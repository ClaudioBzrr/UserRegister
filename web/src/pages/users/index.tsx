import { useCallback, useEffect, useState, type FormEvent } from 'react'
import {
    LucideAlertTriangle,
    LucideInbox,
    LucideMail,
    LucidePencil,
    LucidePlus,
    LucideRefreshCw,
    LucideTrash2,
    LucideUser,
    LucideUserCheck,
    LucideUsers,
} from 'lucide-react'
import style from './index.module.css'
import Avatar from '../../components/ui/avatar'
import Badge from '../../components/ui/badge'
import Button from '../../components/ui/button'
import Input from '../../components/ui/input'
import Modal from '../../components/ui/modal'
import PasswordInput from '../../components/ui/password-input'
import Skeleton from '../../components/ui/skeleton'
import StatCard from '../../components/ui/stat-card'
import { useAuth } from '../../contexts/auth-context'
import { useToast } from '../../contexts/toast-context'
import { api } from '../../services/api'
import type { IApiResponse, ICreateUserPayload, IUpdateUserPayload, IUser } from '../../types/user'

function formatDate(value: string): string {
    return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

interface IUserFormModalProps {
    mode: 'create' | 'edit'
    user?: IUser | null
    submitting: boolean
    onSave: (payload: ICreateUserPayload | IUpdateUserPayload) => Promise<void>
    onClose: () => void
}

function UserFormModal({ mode, user, submitting, onSave, onClose }: IUserFormModalProps) {
    const [name, setName] = useState<string>(user?.name ?? '')
    const [email, setEmail] = useState<string>(user?.email ?? '')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError(null)
        try {
            const payload: ICreateUserPayload | IUpdateUserPayload = mode === 'create'
                ? { name, email, password }
                : { name, email, ...(password ? { password } : {}) }
            await onSave(payload)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }

    return (
        <Modal
            title={mode === 'create' ? 'New user' : 'Edit user'}
            open
            onClose={onClose}
            footer={
                <>
                    <Button type='submit' form='user-form' text={submitting ? 'Saving...' : 'Save'} loading={submitting} />
                    <Button type='button' variant='ghost' text='Cancel' onClick={onClose} disabled={submitting} />
                </>
            }
        >
            <form id='user-form' className={style.form} onSubmit={e => handleSubmit(e)} noValidate>
                <Input
                    label='Name'
                    required
                    placeholder='Full name'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    leftElement={<LucideUser />}
                />
                <Input
                    label='Email'
                    required
                    type='email'
                    placeholder='you@example.com'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    leftElement={<LucideMail />}
                />
                <PasswordInput
                    label={mode === 'create' ? 'Password' : 'New password (optional)'}
                    required={mode === 'create'}
                    placeholder={mode === 'create' ? 'At least 6 characters' : 'Leave blank to keep current'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                {error ? (
                    <div className={style.formError} role='alert'>
                        {error}
                    </div>
                ) : null}
            </form>
        </Modal>
    )
}

export default function Users() {
    const { user: authUser, logout } = useAuth()
    const { toast } = useToast()
    const [users, setUsers] = useState<IUser[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [formOpen, setFormOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<IUser | null>(null)
    const [deleting, setDeleting] = useState<IUser | null>(null)
    const [submitting, setSubmitting] = useState<boolean>(false)

    const loadUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get<IApiResponse<IUser[]>>('/users')
            setUsers(res.data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users.')
            toast(err instanceof Error ? err.message : 'Failed to load users.', 'error')
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        loadUsers()
    }, [loadUsers])

    function openCreate() {
        setEditing(null)
        setFormOpen(true)
    }

    function openEdit(user: IUser) {
        setEditing(user)
        setFormOpen(true)
    }

    async function handleSave(payload: ICreateUserPayload | IUpdateUserPayload) {
        setSubmitting(true)
        try {
            if (editing) {
                await api.put<IApiResponse<never>>(`/users/${editing.id}`, payload)
                toast('User updated successfully.')
            } else {
                await api.post<IApiResponse<never>>('/create-user', payload)
                toast('User created successfully.')
            }
            setFormOpen(false)
            setEditing(null)
            await loadUsers()
        } catch (err) {
            throw err
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete() {
        if (!deleting) return
        setSubmitting(true)
        try {
            await api.del<IApiResponse<never>>(`/users/${deleting.id}`)
            toast('User deleted successfully.')
            const wasSelf = deleting.id === authUser?.id
            setDeleting(null)
            await loadUsers()
            if (wasSelf) logout()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete user.'
            setError(message)
            toast(message, 'error')
        } finally {
            setSubmitting(false)
        }
    }

    const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <>
            <header className={style.pageHeader}>
                <div className={style.pageTitleBlock}>
                    <h1 className={style.pageTitle}>Users</h1>
                    <p className={style.pageSubtitle}>Manage the registered accounts in your platform.</p>
                </div>
                <div className={style.headerActions}>
                    <Button
                        variant='secondary'
                        size='sm'
                        text='Refresh'
                        leftElement={<LucideRefreshCw />}
                        onClick={loadUsers}
                        disabled={loading}
                    />
                    <Button
                        size='sm'
                        text='New user'
                        leftElement={<LucidePlus />}
                        onClick={openCreate}
                    />
                </div>
            </header>

            <div className={style.stats}>
                <StatCard
                    label='Total users'
                    value={loading ? '—' : users.length}
                    icon={<LucideUsers />}
                    tone='primary'
                />
                <StatCard
                    label='Signed in as'
                    value={authUser?.name ?? '—'}
                    icon={<LucideUserCheck />}
                    tone='success'
                />
                <StatCard
                    label='Account email'
                    value={authUser?.email ?? '—'}
                    icon={<LucideMail />}
                    tone='warning'
                />
            </div>

            {error ? (
                <div className={style.errorBanner} role='alert'>
                    <LucideAlertTriangle />
                    <span>{error}</span>
                    <Button size='sm' variant='ghost' text='Dismiss' onClick={() => setError(null)} />
                </div>
            ) : null}

            <div className={style.card}>
                {loading ? (
                    <div className={style.skeletonList}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div className={style.skeletonRow} key={i}>
                                <Skeleton circle width={38} height={38} />
                                <Skeleton width={180} height={16} />
                                <Skeleton width={220} height={16} />
                                <Skeleton width={120} height={16} />
                            </div>
                        ))}
                    </div>
                ) : sortedUsers.length === 0 ? (
                    <div className={style.empty}>
                        <span className={style.emptyIcon}>
                            <LucideInbox />
                        </span>
                        <h2 className={style.emptyTitle}>No users yet</h2>
                        <p className={style.emptyText}>Create the first user account to get started.</p>
                        <Button text='Create first user' leftElement={<LucidePlus />} onClick={openCreate} />
                    </div>
                ) : (
                    <div className={style.tableWrapper}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Created</th>
                                    <th className={style.actionsCol}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.map(user => {
                                    const isSelf = user.id === authUser?.id
                                    return (
                                        <tr key={user.id} className={isSelf ? style.selfRow : undefined}>
                                            <td data-label='User'>
                                                <div className={style.userCell}>
                                                    <Avatar name={user.name} />
                                                    <span className={style.userName}>
                                                        {user.name}
                                                        {isSelf ? <Badge tone='success'>you</Badge> : null}
                                                    </span>
                                                </div>
                                            </td>
                                            <td data-label='Email'>{user.email}</td>
                                            <td data-label='Created'>{formatDate(user.createdAt)}</td>
                                            <td data-label='Actions' className={style.actionsCol}>
                                                <div className={style.rowActions}>
                                                    <Button
                                                        variant='ghost'
                                                        size='sm'
                                                        text='Edit'
                                                        leftElement={<LucidePencil />}
                                                        disabled={!isSelf}
                                                        title={isSelf ? 'Edit your account' : 'You can only edit your own account'}
                                                        onClick={() => openEdit(user)}
                                                    />
                                                    <Button
                                                        variant='danger'
                                                        size='sm'
                                                        text='Delete'
                                                        leftElement={<LucideTrash2 />}
                                                        disabled={!isSelf}
                                                        title={isSelf ? 'Delete your account' : 'You can only delete your own account'}
                                                        onClick={() => setDeleting(user)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {formOpen ? (
                <UserFormModal
                    mode={editing ? 'edit' : 'create'}
                    user={editing}
                    submitting={submitting}
                    onSave={handleSave}
                    onClose={() => {
                        setFormOpen(false)
                        setEditing(null)
                    }}
                />
            ) : null}

            <Modal
                title='Delete user'
                open={Boolean(deleting)}
                onClose={() => setDeleting(null)}
                footer={
                    <>
                        <Button
                            variant='danger'
                            text={submitting ? 'Deleting...' : 'Delete'}
                            loading={submitting}
                            onClick={handleDelete}
                        />
                        <Button variant='ghost' text='Cancel' disabled={submitting} onClick={() => setDeleting(null)} />
                    </>
                }
            >
                <div className={style.deleteConfirm}>
                    <span className={style.deleteIcon}>
                        <LucideAlertTriangle />
                    </span>
                    <p>
                        Are you sure you want to delete <strong>{deleting?.name}</strong>? This action cannot be undone.
                    </p>
                </div>
            </Modal>
        </>
    )
}