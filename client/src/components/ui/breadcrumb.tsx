import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1 text-sm text-muted-foreground mb-4", className)}>
      <Home className="h-4 w-4 shrink-0" />
      {items.map((item, index) => (
        <Fragment key={index}>
          <ChevronRight className="h-4 w-4 shrink-0" />
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-foreground transition-colors truncate max-w-[200px]"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
