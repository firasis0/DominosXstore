import { cn } from "cn";

function Switch({ checked, onCheckedChange, className, "aria-label": ariaLabel }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={ariaLabel} className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", checked ? "bg-primary" : "bg-gray-300", className)} onClick={() => onCheckedChange?.(!checked)}><span className={cn("pointer-events-none block h-4 w-4 rounded-full border border-gray-400 bg-white shadow-sm transition-transform", checked ? "translate-x-4" : "translate-x-0")} /></button>;
}

export { Switch };