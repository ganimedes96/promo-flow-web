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

export function isShopeeLink(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      !u.username &&
      !u.password &&
      !u.port &&
      [
        "shopee.com.br",
        "www.shopee.com.br",
        "s.shopee.com.br",
        "shope.ee",
        "shp.ee",
      ].includes(u.hostname)
    );
  } catch {
    return false;
  }
}
export function isConvertibleLink(value: unknown): value is string {
  return isMercadoLivreLink(value) || isShopeeLink(value);
}
