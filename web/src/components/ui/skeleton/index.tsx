import style from './index.module.css'

interface ISkeletonProps {
    className?: string
    width?: string | number
    height?: string | number
    radius?: string
    circle?: boolean
}

export default function Skeleton({ className, width, height, radius, circle = false }: ISkeletonProps) {
    return (
        <span
            className={[style.skeleton, circle ? style.circle : '', className ?? ''].filter(Boolean).join(' ')}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                borderRadius: radius ?? (circle ? '50%' : undefined),
            }}
            aria-hidden='true'
        />
    )
}