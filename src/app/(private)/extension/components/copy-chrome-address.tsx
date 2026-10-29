"use client";
import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
export function CopyChromeAddress({ address }: { address: string }) {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setMessage("Copiado! Cole na barra de endereços do Chrome.");
    } catch {
      setMessage("Selecione e copie o endereço manualmente.");
    }
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="bg-muted rounded-md px-3 py-2 text-sm break-all">
        {address}
      </code>
      <Button variant="outline" size="sm" onClick={copy}>
        <Copy />
        Copiar endereço
      </Button>
      <span role="status" className="text-muted-foreground text-xs">
        {message}
      </span>
    </div>
  );
}
