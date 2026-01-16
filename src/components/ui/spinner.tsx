import { Loader2Icon } from "lucide-react"

import { cn } from "../../lib/utils"

function Spinner({ className, label = "Loading...", ...props }: React.ComponentProps<"svg"> & { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader2Icon
        role="status"
        aria-label="Loading"
        className={cn("size-4 animate-spin", className)}
        {...props}
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export { Spinner }
