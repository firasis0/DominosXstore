import { cn } from "cn";

function InputGroup({ className, children }) { return <div className={cn("flex h-10 items-center", className)}>{children}</div>; }
function InputGroupAddon({ className, children }) { return <span className={cn("flex items-center text-muted-foreground", className)}>{children}</span>; }
function InputGroupInput({ className, ...props }) { return <input className={cn("h-full w-full border-0 bg-transparent outline-none", className)} {...props} />; }

export { InputGroup, InputGroupAddon, InputGroupInput };