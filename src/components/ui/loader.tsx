import { cn } from '@/lib/utils'

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center items-center py-4', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
