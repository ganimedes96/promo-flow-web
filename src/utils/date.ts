import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

export const TIMEZONE = "America/Sao_Paulo";

export function formatDate(dateStr?: string, format = "dd/MM/yyyy") {
  if (!dateStr) return "N/A";
  return formatInTimeZone(dateStr, TIMEZONE, format, {
    locale: ptBR,
  });
}
