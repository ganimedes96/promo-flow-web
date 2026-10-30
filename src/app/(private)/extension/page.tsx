import { Download, Puzzle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import release from "@/../public/downloads/extension-release.json";
import { CopyChromeAddress } from "./components/copy-chrome-address";
const steps = [
  {
    title: "Baixe e extraia o ZIP",
    text: "Baixe a extensão e extraia o arquivo em uma pasta permanente do computador. Mantenha essa pasta após instalar: o Chrome usa os arquivos dela.",
  },
  {
    title: "Abra as extensões do Chrome",
    text: "Copie o endereço abaixo, cole na barra de endereços do Chrome e pressione Enter. Ative o Modo do desenvolvedor no canto superior direito.",
  },
  {
    title: "Carregue a pasta extraída",
    text: "Clique em Carregar expandida (ou Carregar sem compactação) e selecione a pasta que contém manifest.json. Se houver outra pasta dentro da extraída, abra até encontrar esse arquivo. Não selecione o ZIP.",
  },
  {
    title: "Fixe a extensão",
    text: "Abra o ícone de quebra-cabeça ao lado da barra de endereços e fixe PromoFlow — Importar produtos. Pronto: agora abra a página de um produto para capturar os dados.",
  },
];
export default function ExtensionPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Extensão do PromoFlow</h1>
        <p className="text-muted-foreground mt-2">
          Importe produtos do Mercado Livre, da Amazon Brasil e da Shopee com
          menos preenchimento manual.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Puzzle className="text-primary size-6" />
            <Badge variant="secondary">Chrome no computador</Badge>
            <Badge variant="outline">Versão {release.version}</Badge>
          </div>
          <CardTitle>Capture o produto e revise no PromoFlow</CardTitle>
          <CardDescription>
            Preencha título, descrição, imagens, preço atual e preço original
            com os dados disponíveis na página do produto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild size="lg">
            <a
              href={`/downloads/promoflow-extension-${release.version}.zip`}
              download
            >
              <Download />
              Baixar extensão
            </a>
          </Button>
          <p className="text-muted-foreground text-sm">
            Por enquanto, a instalação é manual. O download não instala
            automaticamente: siga os passos abaixo. Não é necessário instalar
            Node.js ou executar comandos.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Como instalar</CardTitle>
          <CardDescription>
            Faça isso uma vez em cada computador que utilizar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full font-semibold">
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-2">
                  <h2 className="font-medium">{step.title}</h2>
                  <p className="text-muted-foreground text-sm">{step.text}</p>
                  {index === 1 && (
                    <CopyChromeAddress address="chrome://extensions" />
                  )}
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Como importar uma oferta</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-3 text-sm">
            <p>
              Abra um produto do Mercado Livre, da Amazon Brasil ou da Shopee,
              clique na extensão e em “Capturar e abrir no PromoFlow”.
            </p>
            <p>
              Faça login se necessário, confira imagens, preços, variação e
              condições de pagamento. Informe o link de afiliado e o cupom
              quando houver e selecione um grupo favorito.
            </p>
            <p>
              A captura abre um rascunho. A oferta só será cadastrada ao clicar
              em salvar.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Atalho de captura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Use Alt + Shift + P na página do produto. Se não funcionar, abra o
              endereço abaixo e defina o atalho em “Capturar produto e revisar
              no PromoFlow”. Se estiver em uso, escolha outra combinação.
            </p>
            <CopyChromeAddress address="chrome://extensions/shortcuts" />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Como atualizar</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            Baixe a versão disponível nesta tela, extraia e substitua os
            arquivos na mesma pasta usada na instalação. Em chrome://extensions,
            clique no ícone de recarregar da extensão PromoFlow e atualize a aba
            do produto.
          </p>
          <p>
            Se mudar a pasta de lugar, remova a instalação antiga e carregue a
            nova pasta. A instalação manual não recebe atualizações automáticas
            pela loja.
          </p>
          <a
            href="https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Ver instruções oficiais do Chrome
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
