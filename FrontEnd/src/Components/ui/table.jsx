import { cn } from "cn";

const Table = ({ className, ...props }) => <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom text-sm", className)} {...props} /></div>;
const TableHeader = ({ className, ...props }) => <thead className={cn("[&_tr]:border-b", className)} {...props} />;
const TableBody = ({ className, ...props }) => <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
const TableRow = ({ className, ...props }) => <tr className={cn("border-b transition-colors hover:bg-muted/50", className)} {...props} />;
const TableHead = ({ className, ...props }) => <th className={cn("h-10 px-4 text-left align-middle text-xs font-medium text-muted-foreground", className)} {...props} />;
const TableCell = ({ className, ...props }) => <td className={cn("p-4 align-middle", className)} {...props} />;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };