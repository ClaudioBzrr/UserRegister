import style from './index.module.css'

interface IAvatarProps {
    name: string
    size?: 'sm' | 'md'
}

const PALETTE = [
    '#7c6cf6', '#5aa7f0', '#34d399', '#f59e0b',
    '#f87171', '#ec4899', '#22d3ee', '#a78bfa',
]

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function hashName(name: string): number {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

export default function Avatar({ name, size = 'md' }: IAvatarProps) {
    const color = PALETTE[hashName(name) % PALETTE.length]
    return (
        <span
            className={[style.avatar, style[size]].filter(Boolean).join(' ')}
            style={{ backgroundColor: `${color}26`, color }}
            aria-hidden='true'
        >
            {initials(name)}
        </span>
    )
}