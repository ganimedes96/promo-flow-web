export function isMercadoLivreLink(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "meli.la" ||
        url.hostname === "www.meli.la" ||
        url.hostname === "mercadolivre.com.br" ||
        url.hostname.endsWith(".mercadolivre.com.br"))
    );
  } catch {
    return false;
  }
}
