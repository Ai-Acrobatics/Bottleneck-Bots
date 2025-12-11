import { ReactNode } from 'react';
import { Card } from './card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { cn } from '@/lib/utils';

interface Column<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => ReactNode;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string;
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  onRowClick,
  keyExtractor,
  className
}: ResponsiveTableProps<T>) {
  return (
    <>
      {/* Mobile: Card view */}
      <div className={cn("md:hidden space-y-3", className)}>
        {data.map((item) => (
          <Card
            key={keyExtractor(item)}
            className={cn("p-4", onRowClick && "cursor-pointer hover:bg-muted/50 transition-colors")}
            onClick={() => onRowClick?.(item)}
          >
            <div className="space-y-2">
              {columns.map((col) => (
                <div key={col.id} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">{col.header}</span>
                  <span className="text-sm font-medium text-right">
                    {col.cell ? col.cell(item) : String(item[col.accessorKey] ?? '-')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: Table view */}
      <div className={cn("hidden md:block", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.filter(c => !c.hideOnMobile).map((col) => (
                <TableHead key={col.id}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow
                key={keyExtractor(item)}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(item)}
              >
                {columns.filter(c => !c.hideOnMobile).map((col) => (
                  <TableCell key={col.id}>
                    {col.cell ? col.cell(item) : String(item[col.accessorKey] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
