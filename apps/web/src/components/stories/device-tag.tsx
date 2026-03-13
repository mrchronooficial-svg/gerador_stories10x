"use client"

import { cn } from "@criator_stories/ui/lib/utils"

interface DeviceTagProps {
  id: number
  name: string
  className?: string
}

export function DeviceTag({ id, name, className }: DeviceTagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400",
        className
      )}
    >
      <span className="font-bold">#{id}</span>
      {name}
    </span>
  )
}
