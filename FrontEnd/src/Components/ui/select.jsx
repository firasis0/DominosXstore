import { ChevronDown } from "lucide-react";
import { cn } from "cn";

function Select({ value, onValueChange, children, className, ...props }) {
  return <div className={cn("relative", className)}><select value={value} onChange={(event) => onValueChange?.(event.target.value)} {...props}>{children}</select><ChevronDown aria-hidden="true" /></div>;
}

const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

export { Select, SelectItem };