"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/shadcn/utils";
import { countActionNodes } from "@/utils/array";
import {
  getValueByColumnKey,
  NestedKeyOf,
  PathValue,
} from "@/utils/data-table";
import { type ReactNode, Fragment, useId, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { LoadMore, LoadMoreMobile } from "./load-more";

export interface ColumnDef<T, K extends NestedKeyOf<T> = NestedKeyOf<T>> {
  key: K;
  header: string;
  render?: (value: PathValue<T, K>, row: T) => ReactNode;
  className?: HTMLTableCellElement["className"];
  /** Se true, esta coluna será destacada como título no card mobile */
  primary?: boolean;
  /** Se true, esta coluna será exibida como status no canto superior direito */
  isStatus?: boolean;
  /** Se true, esta coluna não será exibida no modo mobile */
  hideOnMobile?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  renderExpanded?: (row: T) => ReactNode;
  expandLabel?: string;
  columns: ColumnDef<T>[];
  actions?: (row: T) => ReactNode;
  loadingActionsCount?: number;
  actionsHeader?: string;
  actionsClassName?: string;
  loading?: boolean;
  loadingRows?: number;
  getRowKey?: (row: T, index: number) => string | number;
  emptyMessage?: string;
  className?: string;
  infiniteScroll?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export function DataTable<T>({
  data,
  renderExpanded,
  expandLabel = "Ver detalhes",
  columns,
  actions,
  loadingActionsCount,
  actionsHeader = "Ações",
  actionsClassName,
  loading = false,
  loadingRows = 8,
  getRowKey,
  emptyMessage = "Nenhum registro encontrado.",
  className,
  infiniteScroll = false,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
}: DataTableProps<T>) {
  const [expandedKeys, setExpandedKeys] = useState<Set<string | number>>(
    new Set()
  );
  const tableId = useId();
  const toggleExpanded = (key: string | number) =>
    setExpandedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const hasActions = !!actions;
  const totalColumns =
    columns.length + (hasActions ? 1 : 0) + (renderExpanded ? 1 : 0);
  const resolvedLoadingActionsCount = useMemo(() => {
    if (!hasActions) {
      return 0;
    }
    if (loadingActionsCount) return Math.max(1, loadingActionsCount);

    try {
      const previewActions = actions({} as T);
      const count = countActionNodes(previewActions);

      if (count > 0) {
        return count;
      }
    } catch {
      // fallback para contagem padrão quando não for possível inferir
    }
    return 2;
  }, [actions, hasActions, loadingActionsCount]);

  const primaryColumn = columns.find((col) => col.primary) || columns[0];
  const statusColumn = columns.find((col) => col.isStatus);
  const secondaryColumns = columns.filter(
    (col) => col !== primaryColumn && !col.isStatus && !col.hideOnMobile
  );

  return (
    <>
      <div
        className={cn(
          "border-border bg-card hidden rounded-md border lg:block dark:bg-transparent",
          className
        )}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {renderExpanded && (
                <TableHead className="w-12">
                  <span className="sr-only">Detalhes</span>
                </TableHead>
              )}
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn("font-semibold", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}

              {hasActions && (
                <TableHead className={cn("text-center", actionsClassName)}>
                  {actionsHeader}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading &&
              Array.from({ length: loadingRows }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`}>
                  {renderExpanded && (
                    <TableCell>
                      <Skeleton className="size-7" />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} className={col.className}>
                      <Skeleton className="h-4 w-[60%] rounded" />
                    </TableCell>
                  ))}

                  {hasActions && (
                    <TableCell className={cn("text-center", actionsClassName)}>
                      <div className="flex items-center justify-center gap-2">
                        {Array.from({
                          length: resolvedLoadingActionsCount,
                        }).map((_, idx) => (
                          <Skeleton
                            key={`desktop-action-skeleton-${rowIdx}-${idx}`}
                            className="h-8 w-8 rounded"
                          />
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}

            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="text-muted-foreground h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              data.map((row, rowIdx) => {
                const key = getRowKey ? getRowKey(row, rowIdx) : rowIdx;

                return (
                  <Fragment key={key}>
                    <TableRow>
                      {renderExpanded && (
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={
                              expandedKeys.has(key)
                                ? "Recolher detalhes"
                                : expandLabel
                            }
                            aria-expanded={expandedKeys.has(key)}
                            aria-controls={`${tableId}-desktop-${key}`}
                            onClick={() => toggleExpanded(key)}
                          >
                            {expandedKeys.has(key) ? (
                              <ChevronDown />
                            ) : (
                              <ChevronRight />
                            )}
                          </Button>
                        </TableCell>
                      )}
                      {columns.map((col) => {
                        const value = getValueByColumnKey(row, col.key);

                        return (
                          <TableCell
                            key={String(col.key)}
                            className={col.className}
                          >
                            {col.render
                              ? col.render(value, row)
                              : String(value ?? "")}
                          </TableCell>
                        );
                      })}

                      {hasActions && (
                        <TableCell
                          className={cn("text-center", actionsClassName)}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {actions(row)}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                    {renderExpanded && expandedKeys.has(key) && (
                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                        <TableCell
                          colSpan={totalColumns}
                          className="whitespace-normal"
                        >
                          <div id={`${tableId}-desktop-${key}`} className="p-3">
                            {renderExpanded(row)}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}

            {infiniteScroll && onLoadMore && (
              <LoadMore
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={onLoadMore}
                colSpan={totalColumns}
              />
            )}
          </TableBody>
        </Table>
      </div>
      <div className={cn("lg:hidden", className)}>
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: loadingRows }).map((_, idx) => (
              <div
                key={`mobile-skeleton-${idx}`}
                className="border-border bg-card rounded-lg border p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <Skeleton className="h-5 w-[65%] rounded" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>

                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-20 rounded" />
                      <Skeleton className="h-4 w-28 rounded" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-3 w-16 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                  </div>

                  {hasActions && (
                    <div className="border-border mt-3 flex justify-end gap-1 border-t pt-3">
                      {Array.from({ length: resolvedLoadingActionsCount }).map(
                        (_, actionIdx) => (
                          <Skeleton
                            key={`mobile-action-skeleton-${idx}-${actionIdx}`}
                            className="h-9 w-9 rounded-md"
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="border-border bg-card flex h-32 items-center justify-center rounded-lg border">
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        )}
        {!loading && data.length > 0 && (
          <div className="space-y-3">
            {data.map((row, rowIdx) => {
              const key = getRowKey ? getRowKey(row, rowIdx) : rowIdx;
              const primaryValue = getValueByColumnKey(row, primaryColumn.key);
              const statusValue = statusColumn
                ? getValueByColumnKey(row, statusColumn.key)
                : null;

              return (
                <div
                  key={key}
                  className="border-border bg-card active:bg-muted/50 rounded-lg border p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-foreground min-w-0 flex-1 overflow-hidden font-medium wrap-break-word">
                      {primaryColumn.render ? (
                        primaryColumn.render(primaryValue, row)
                      ) : (
                        <span className="block truncate">
                          {String(primaryValue ?? "")}
                        </span>
                      )}
                    </div>

                    {statusColumn && statusValue !== null && (
                      <div className="shrink-0">
                        {statusColumn.render
                          ? statusColumn.render(statusValue, row)
                          : String(statusValue ?? "")}
                      </div>
                    )}
                  </div>
                  {secondaryColumns.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-start gap-4">
                      {secondaryColumns.map((col) => {
                        const value = getValueByColumnKey(row, col.key);
                        const renderedValue = col.render
                          ? col.render(value, row)
                          : String(value ?? "");

                        if (!renderedValue && renderedValue !== 0) return null;

                        return (
                          <div
                            key={String(col.key)}
                            className="flex flex-col gap-1 text-sm"
                          >
                            <span className="text-muted-foreground shrink-0 text-[10px] font-medium tracking-wider uppercase">
                              {col.header}:
                            </span>
                            <span className="text-foreground truncate">
                              {renderedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {hasActions && (
                    <div className="border-border mt-3 flex flex-wrap justify-end gap-2 border-t pt-3">
                      {actions(row)}
                    </div>
                  )}
                  {renderExpanded && (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        aria-expanded={expandedKeys.has(key)}
                        aria-controls={`${tableId}-mobile-${key}`}
                        onClick={() => toggleExpanded(key)}
                      >
                        {expandedKeys.has(key) ? (
                          <ChevronDown />
                        ) : (
                          <ChevronRight />
                        )}
                        {expandedKeys.has(key)
                          ? "Recolher detalhes"
                          : expandLabel}
                      </Button>
                      {expandedKeys.has(key) && (
                        <div id={`${tableId}-mobile-${key}`} className="mt-4">
                          {renderExpanded(row)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {infiniteScroll && onLoadMore && (
              <LoadMoreMobile
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                fetchNextPage={onLoadMore}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
