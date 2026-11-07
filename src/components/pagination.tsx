"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination";

export function ListPagination({
  page,
  totalPages,
  onPage,
  label,
  busy = false,
  hideSinglePage = false,
  summary,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  label: string;
  busy?: boolean;
  hideSinglePage?: boolean;
  summary?: string;
}) {
  const lastPage = Math.max(1, totalPages);
  const currentPage = Math.min(Math.max(1, page), lastPage);
  if (hideSinglePage && lastPage === 1) return null;
  const pages = [
    ...new Set([1, currentPage - 1, currentPage, currentPage + 1, lastPage]),
  ]
    .filter((value) => value >= 1 && value <= lastPage)
    .sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm">
        {summary && <>{summary} · </>}Página {currentPage} de {lastPage}
      </p>
      <Pagination className="mx-0 w-auto" aria-label={label}>
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy || currentPage <= 1}
              onClick={() => onPage(currentPage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
            </Button>
          </PaginationItem>
          {pages.map((value, index) => (
            <PaginationItem key={value} className="hidden sm:flex">
              {index > 0 && value - pages[index - 1] > 1 && (
                <PaginationEllipsis />
              )}
              <Button
                type="button"
                size="sm"
                variant={value === currentPage ? "outline" : "ghost"}
                aria-current={value === currentPage ? "page" : undefined}
                aria-label={`Ir para a página ${value}`}
                disabled={busy}
                onClick={() => onPage(value)}
              >
                {value}
              </Button>
            </PaginationItem>
          ))}
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy || currentPage >= lastPage}
              onClick={() => onPage(currentPage + 1)}
              aria-label="Próxima página"
            >
              Próxima <ChevronRight className="size-4" aria-hidden="true" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
