import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";

function Pagination({ page = 1, pageCount = 1, onPageChange, className }) {
  return <nav aria-label="Pagination" className={cn("flex items-center gap-1", className)}><button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}><ChevronLeft size={15} /></button><span>Page {page} of {pageCount}</span><button type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => onPageChange?.(page + 1)}><ChevronRight size={15} /></button></nav>;
}

export { Pagination };