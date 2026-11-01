import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
export function SupportPagination({
  page,
  total,
  busy,
  onPage,
  label,
}: {
  page: number;
  total: number;
  busy: boolean;
  onPage: (page: number) => void;
  label: string;
}) {
  const pages = Math.max(1, Math.ceil(total / 10));
  if (pages === 1) return null;
  return (
    <Pagination aria-label={label}>
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Anterior
          </Button>
        </PaginationItem>
        <PaginationItem>
          <span className="px-3 text-xs">
            {page} de {pages}
          </span>
        </PaginationItem>
        <PaginationItem>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || page >= pages}
            onClick={() => onPage(page + 1)}
          >
            Próxima
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
