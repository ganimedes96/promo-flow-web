# next-template

Template oficial para sistemas web da organização. Este repositório define a arquitetura, convenções e padrões que devem ser seguidos em todos os projetos Next.js. Modificações pontuais são permitidas desde que a estrutura central e as convenções aqui descritas sejam preservadas.

---

## Sumário

- [Tecnologias](#tecnologias)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Arquitetura de Rotas](#arquitetura-de-rotas)
- [Camada de API](#camada-de-api)
- [Domínios](#domínios)
- [Autenticação e Sessão](#autenticação-e-sessão)
- [Controle de Permissões](#controle-de-permissões)
- [Gerenciamento de Estado (TanStack Query)](#gerenciamento-de-estado-tanstack-query)
- [Formulários](#formulários)
- [Componentes de UI](#componentes-de-ui)
- [Hooks Customizados](#hooks-customizados)
- [Utilitários](#utilitários)
- [Estilização e Temas](#estilização-e-temas)
- [Convenções de Código](#convenções-de-código)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## Tecnologias

| Tecnologia           | Versão | Finalidade                       |
| -------------------- | ------ | -------------------------------- |
| Next.js              | 16.x   | Framework principal (App Router) |
| React                | 19.x   | Biblioteca de UI                 |
| TypeScript           | 5.x    | Tipagem estática                 |
| TailwindCSS          | 4.x    | Estilização                      |
| shadcn/ui + Radix UI | -      | Componentes de UI acessíveis     |
| TanStack Query       | 5.x    | Gerenciamento de estado e cache  |
| NextAuth.js          | 4.x    | Autenticação                     |
| React Hook Form      | 7.x    | Gerenciamento de formulários     |
| Zod                  | 4.x    | Validação de schemas             |
| Sonner               | 2.x    | Notificações toast               |
| date-fns             | 4.x    | Manipulação de datas             |
| Recharts             | 2.x    | Gráficos                         |
| Lucide React         | -      | Ícones                           |

---

## Configuração do Ambiente

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp env.example .env.local
```

| Variável                        | Obrigatória | Descrição                                                 |
| ------------------------------- | ----------- | --------------------------------------------------------- |
| `NEXTAUTH_SECRET`               | Sim         | Segredo para assinar os tokens JWT do NextAuth            |
| `NEXTAUTH_URL`                  | Sim         | URL base da aplicação (ex: `http://localhost:3000/login`) |
| `NEXT_PUBLIC_MODE`              | Sim         | Modo de execução: `dev`, `demo` ou `prod`                 |
| `NEXT_PUBLIC_API_DEV_BASE_URL`  | Sim         | URL base da API em desenvolvimento                        |
| `NEXT_PUBLIC_API_DEMO_BASE_URL` | Sim         | URL base da API em demonstração                           |
| `NEXT_PUBLIC_API_PROD_BASE_URL` | Sim         | URL base da API em produção                               |

A variável `NEXT_PUBLIC_MODE` controla qual URL de API será utilizada em runtime, tanto no cliente quanto no servidor. Os valores aceitos são validados via Zod em `src/env.ts` — a aplicação lanca um erro explícito na inicialização se qualquer variável estiver ausente ou inválida.

### 3. Iniciar o servidor de desenvolvimento

```bash
pnpm dev
```

---

## Estrutura de Pastas

```
src/
├── api/                    # Camada de comunicação com a API externa
│   ├── client.ts           # fetchClient — chamadas no lado do cliente
│   ├── server.ts           # fetchServer — chamadas no lado do servidor (RSC / Server Actions)
│   ├── config.ts           # Seleciona a URL base conforme NEXT_PUBLIC_MODE
│   ├── error.ts            # Classe HandleError — normalização de erros
│   └── types.ts            # Interfaces compartilhadas de resposta da API
│
├── app/
│   ├── (private)/          # Rotas protegidas (requer autenticação)
│   │   ├── layout.tsx      # Layout com sidebar e header
│   │   ├── control-panel/
│   │   └── events/         # Exemplo de módulo completo (listagem, detalhe, criar, editar)
│   ├── (public)/           # Rotas públicas (landing page, login)
│   ├── api/auth/           # Handler do NextAuth
│   ├── forbidden/          # Página 403
│   ├── unauthorized/       # Página 401
│   ├── global-error.tsx    # Error boundary global
│   ├── globals.css         # Estilos globais e tokens de design
│   └── layout.tsx          # Layout raiz (providers, metadata, fonte)
│
├── assets/                 # Imagens e assets estáticos importáveis
│
├── components/
│   ├── can/                # Controle de acesso por permissão
│   │   ├── client.tsx      # <CanClient> — uso em Client Components
│   │   └── server.tsx      # <CanServer> — uso em Server Components
│   ├── form/
│   │   ├── containers/     # Wrappers de formulário (Sheet, Global, Step)
│   │   └── controllers/    # Campos controlados pelo React Hook Form
│   ├── sidebar/            # Componentes do layout da área privada
│   ├── pagination/         # Componente de paginação incremental
│   └── ui/                 # Componentes base do shadcn/ui (não editar diretamente)
│
├── domains/                # Lógica de negócio por domínio
│   ├── auth/               # Login, tipos de usuário, permissões (enums)
│   ├── events/             # Exemplo: types, client.ts, server.ts, actions.ts
│   ├── tags/
│   └── general/
│
├── env.ts                  # Validação e exportação das variáveis de ambiente via Zod
├── fonts.ts                # Configuração das fontes Google (Inter, Unbounded)
│
├── hooks/
│   ├── use-debounce.ts
│   ├── use-mobile.ts
│   ├── use-paginated-list.ts   # Hook de listagem infinita com TanStack Query
│   └── use-server-action.ts    # Hook para Server Actions com feedback automático
│
├── lib/
│   ├── next-auth/auth.ts   # Configuração do NextAuth (authOptions, getServerSession)
│   ├── shadcn/utils.ts     # Utilitário cn() para merge de classes Tailwind
│   ├── tanstack-query/     # Configuração do QueryClient, chaves e métodos
│   └── toast/              # Configuração e wrappers do Sonner
│
├── providers/              # Providers React (Auth, Query, Theme)
│
├── proxy.ts                # Middleware de autenticação de rotas (proxy.ts = middleware.ts)
│
├── types/
│   ├── next-auth.d.ts      # Extensão de tipos da sessão do NextAuth
│   └── params.ts           # Tipos de parâmetros de rota (params, searchParams)
│
└── utils/
    ├── date.ts             # Formatação de datas
    ├── mask.ts             # Máscaras de input
    ├── permissions.ts      # Mapa de rotas/permissões e funções auxiliares
    ├── queries.ts          # Codificação de query strings
    ├── regex.ts            # Padrões de expressão regular reutilizáveis
    └── text.ts             # Utilitários de texto
```

---

## Arquitetura de Rotas

O projeto usa **Route Groups** do App Router para separar contextos sem afetar a URL:

- `(public)/` — Rotas acessíveis sem autenticação: `/`, `/login`
- `(private)/` — Rotas que exigem sessão ativa. O layout deste grupo renderiza a sidebar e o header.

### Proxy (Middleware)

O arquivo `src/proxy.ts` (equivalente ao `middleware.ts` do Next.js) protege as rotas:

```ts
// src/proxy.ts
const publicRoutes: PublicRoute[] = [
  { path: "/login", whenAuthed: "redirect" }, // redireciona para /control-panel se autenticado
  { path: "/", whenAuthed: "not-redirect" }, // permanece acessível mesmo autenticado
];
```

- Usuários **não autenticados** em rotas privadas são redirecionados para `/login`.
- Usuários **autenticados** em `/login` são redirecionados para `/control-panel`.

Para adicionar novas rotas públicas, inclua-as no array `publicRoutes` de `src/proxy.ts`.

### Convenção de Páginas

Cada rota de um módulo segue o padrão:

```
app/(private)/[modulo]/
├── (list)/
│   ├── page.tsx                    # Listagem
│   └── components/
│       ├── [modulo]-list.tsx       # Componente de listagem
│       ├── loading.tsx             # Skeleton de carregamento
│       └── helpers.tsx             # Funções auxiliares locais
├── [id]/
│   ├── page.tsx                    # Detalhes
│   ├── loading.tsx
│   ├── components/
│   └── update/
│       ├── page.tsx                # Edição
│       └── components/
└── create/
    ├── page.tsx                    # Criação
    └── components/
```

---

## Camada de API

Toda comunicação com a API externa passa **obrigatoriamente** por `src/api/client.ts` ou `src/api/server.ts`. Nunca chame `fetch` diretamente em páginas ou componentes.

### `fetchClient` — Client Components

```ts
// src/domains/events/client.ts
import { fetchClient } from "@/api/client";

export async function getEvents(params) {
  const data = await fetchClient<ApiResponsePaginated<Event[]>>(
    `/events${queryString}`
  );
  return data;
}
```

- Obtém o token JWT via `getSession()` (next-auth/react)
- Realiza logout automático em respostas `401`
- Lança `HandleError` tipado em respostas `403` e outros erros

### `fetchServer` — Server Components e Server Actions

```ts
// src/domains/events/server.ts
import { fetchServer } from "@/api/server";

export async function getEventById(id: string) {
  const { data } = await fetchServer<ApiResponse<EventDetails>>(
    `/events/${id}`
  );
  return data;
}
```

- Obtém o token JWT via `getServerSession()` (next-auth)
- Redireciona para `/unauthorized` em `401` quando há sessão ativa
- Usa o `env` validado via Zod para obter a URL base

### Tipos de resposta

```ts
// src/api/types.ts

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface ApiResponsePaginated<T> {
  status: number;
  message: string;
  data: T;
  pagination: Pagination;
}

interface ApiResponseError {
  message: string;
  code: number;
  status: string;
  timestamp: string;
}
```

---

## Domínios

Cada entidade de negócio possui sua própria pasta em `src/domains/[entidade]/` com os seguintes arquivos:

| Arquivo      | Responsabilidade                                                    |
| ------------ | ------------------------------------------------------------------- |
| `types.ts`   | Interfaces e enums TypeScript da entidade                           |
| `client.ts`  | Funções de leitura para Client Components (usa `fetchClient`)       |
| `server.ts`  | Funções de leitura para Server Components (usa `fetchServer`)       |
| `actions.ts` | Server Actions para mutações (POST, PUT, DELETE) com `"use server"` |
| `enums.ts`   | Enumerações específicas do domínio                                  |

### Exemplo: criando um novo domínio

```ts
// src/domains/products/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}
export interface CreateProduct {
  name: string;
  price: number;
}

// src/domains/products/server.ts
import { fetchServer } from "@/api/server";
import { ApiResponse } from "@/api/types";
import { Product } from "./types";

export async function getProductById(id: string) {
  const { data } = await fetchServer<ApiResponse<Product>>(`/products/${id}`);
  return data;
}

// src/domains/products/actions.ts
("use server");
import { fetchServer } from "@/api/server";
import { ApiResponse, ApiResponseError } from "@/api/types";
import { CreateProduct, Product } from "./types";

export async function createProduct(body: CreateProduct) {
  try {
    return await fetchServer<ApiResponse<Product>>("/products", {
      method: "POST",
      body,
    });
  } catch (error) {
    return error as ApiResponseError;
  }
}
```

---

## Autenticação e Sessão

A autenticação é feita via **NextAuth.js v4** com `CredentialsProvider`, utilizando estratégia **JWT**.

- **Duração da sessão:** 7 dias
- **Página de login:** `/login`
- **Informações na sessão:** `id`, `email`, `name`, `role`, `permissions`, `token` (JWT da API)

### Acessar a sessão

```ts
// Em Server Components / Server Actions
import { getServerSession } from "@/lib/next-auth/auth";
const session = await getServerSession();

// Em Client Components
import { useSession } from "next-auth/react";
const { data: session } = useSession();
```

> Sempre importe `getServerSession` de `@/lib/next-auth/auth` (wrapper interno), não diretamente do `next-auth`.

### Extensão de tipos

O arquivo `src/types/next-auth.d.ts` estende os tipos padrão da sessão para incluir `role`, `permissions` e `token`. Ao adicionar novos campos ao token JWT, atualize este arquivo.

---

## Controle de Permissões

O sistema usa um enum `Permission` definido em `src/domains/auth/enums.ts`. As permissões são armazenadas na sessão e checadas em tempo de execução.

### Componentes `<Can>`

Use os componentes `<CanServer>` e `<CanClient>` para renderização condicional baseada em permissão:

```tsx
// Em Server Components
import { CanServer } from "@/components/can/server";
import { Permission } from "@/domains/auth/enums";

<CanServer permission={Permission.createEvents}>
  <Button>Criar evento</Button>
</CanServer>;

// Em Client Components
import { CanClient } from "@/components/can/client";

<CanClient
  permission={Permission.deleteEvents}
  fallback={<span>Sem acesso</span>}
>
  <DeleteButton />
</CanClient>;
```

Ambos aceitam `permission` como valor único ou array. Quando array, **todas** as permissões precisam estar presentes (lógica `AND`).

### Mapa de rotas e permissões

`src/utils/permissions.ts` mantém o mapeamento entre rotas e permissões necessárias. Ao adicionar um novo módulo, inclua sua entrada neste arquivo:

```ts
// src/utils/permissions.ts
export const routePermissionsMap = {
  "/products": {
    view: Permission.viewProducts,
    create: Permission.createProducts,
    update: Permission.updateProducts,
    delete: Permission.deleteProducts,
  },
};
```

---

## Gerenciamento de Estado em APIs (TanStack Query)

### Query Keys

Todas as chaves de query são centralizadas em `src/lib/tanstack-query/keys.ts`.

```ts
// src/lib/tanstack-query/keys.ts
const eventsKeys = {
  all: ["events"] as const,
  lists: () => [...eventsKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...eventsKeys.lists(), params ?? {}] as const,
  details: () => [...eventsKeys.all, "detail"] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
};
```

### Listagem com paginação incremental

Use o hook `usePaginatedList` para listas com "carregar mais":

```tsx
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { queryKey } from "@/lib/tanstack-query/keys";
import { getEvents } from "@/domains/events/client";

const {
  items,
  total,
  currentTotal,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = usePaginatedList({
  queryKey: [queryKey.events.list(params)],
  queryFn: ({ pageParam }) => getEvents({ page: pageParam }),
});
```

### Invalidar/refazer queries após mutação

```ts
import { refetchQuery } from "@/lib/tanstack-query/methods";
import { queryKey } from "@/lib/tanstack-query/keys";

await refetchQuery([queryKey.events.lists()]);
```

---

## Formulários

Todos os formulários usam **React Hook Form** com campos controlados da pasta `src/components/form/controllers/`.

### Hook `useServerAction`

Wrapper sobre `useMutation` do TanStack Query que integra automaticamente o feedback de toast (sucesso/erro) com Server Actions:

```tsx
import { useServerAction } from "@/hooks/use-server-action";
import { createEvent } from "@/domains/events/actions";

const { mutateAsync, isPending } = useServerAction<Event, CreateEvent>({
  mutationFn: (data) => createEvent(data),
  onSuccess: async () => {
    await refetchQuery([queryKeys.events.lists()]);
    router.back();
  },
  // successMessage e errorMessage são opcionais; por padrão usa a mensagem retornada pela API
});
```

## Gerenciamento de Estado Local Persistente (Zustand + LocalStorage)

### Controladores disponíveis

| Componente                 | Uso                       |
| -------------------------- | ------------------------- |
| `ControlledInput`          | Campo de texto simples    |
| `ControlledTextarea`       | Área de texto             |
| `ControlledSelect`         | Seleção única             |
| `ControlledMultiSelect`    | Seleção múltipla          |
| `ControlledCombobox`       | Combobox com busca        |
| `ControlledCheckbox`       | Checkbox                  |
| `ControlledSwitch`         | Toggle switch             |
| `ControlledDatePicker`     | Seletor de data           |
| `ControlledDateTimePicker` | Seletor de data e hora    |
| `ControlledImages`         | Upload de imagem(ns)      |
| `ControlledInputCurrency`  | Campo monetário           |
| `ControlledArrayInput`     | Lista de inputs dinâmicos |

Todos recebem `name`, `control` e `rules` (regras do React Hook Form).

### Containers de formulário

- `GlobalForm` — Wrapper padrão para formulários de página inteira
- `FormSheet` — Formulário dentro de um `Sheet` lateral
- `StepProgressBar` — Formulário multi-etapas com barra de progresso

---

## Componentes de UI

Os componentes em `src/components/ui/` são provenientes do **shadcn/ui** e não devem ser editados diretamente. Para customizações, crie um componente wrapper.

Para adicionar novos componentes do shadcn:

```bash
pnpm dlx shadcn@latest add [component-name]
```

---

## Hooks Customizados

| Hook               | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| `useServerAction`  | Mutações com Server Actions + toast automático |
| `usePaginatedList` | Listagem infinita com TanStack Query           |
| `useDebounce`      | Debounce de valor para buscas                  |
| `useMobile`        | Detecta se o viewport é mobile                 |

---

## Utilitários

| Arquivo                | Funções exportadas                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `utils/date.ts`        | Formatação de datas com `date-fns` e suporte a timezone                            |
| `utils/mask.ts`        | Máscaras de CPF, CNPJ, telefone, CEP                                               |
| `utils/permissions.ts` | `hasPermission`, `getRoutePermission`, `routePermissionsMap`, `permissionsModules` |
| `utils/queries.ts`     | `encodeQueryString` — monta query strings sem parâmetros nulos                     |
| `utils/regex.ts`       | Padrões regex: URL, Instagram, Facebook, email, etc.                               |
| `utils/text.ts`        | Utilitários de manipulação de strings                                              |
| `lib/shadcn/utils.ts`  | `cn()` — merge de classes Tailwind com `clsx` + `tailwind-merge`                   |

---

## Estilização e Temas

### Tokens de design

As variáveis CSS são definidas em `src/app/globals.css` usando `oklch`. O projeto suporta modo claro e escuro via `next-themes`.

Os tokens seguem o padrão do shadcn/ui: `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--destructive`, `--success`, `--warning`, `--info`, `--border`, `--ring`, entre outros.

### Tipografia

Fontes configuradas em `src/fonts.ts`:

- **Inter** — Fonte padrão do corpo (`font-sans`)
- **Unbounded** — Fonte de destaque/títulos (variável `--font-unbounded`)

### Responsividade

O `globals.css` inclui breakpoints globais de fonte:

- `≤ 1550px` → `font-size: 90%`
- `≤ 1000px` → `font-size: 85%`

---

## Convenções de Código

### Nomenclatura de arquivos

- Componentes React: `kebab-case.tsx` (ex: `events-list.tsx`)
- Hooks: `use-nome-do-hook.ts`
- Utilitários e funções: `kebab-case.ts`
- Enums e tipos: `types.ts` / `enums.ts` dentro do domínio

### Nomenclatura de funções e variáveis

- Funções: `camelCase` (ex: `getEventById`, `createEvent`)
- Componentes: `PascalCase` (ex: `EventsList`, `CanServer`)
- Constantes e enums: `PascalCase` para o enum, `camelCase` para variáveis

### Imports

Use sempre o alias `@/` para imports absolutos:

```ts
// Correto
import { fetchServer } from "@/api/server";

// Incorreto
import { fetchServer } from "../../api/server";
```

### Separação de responsabilidades

| Camada                    | Onde fica                       | Regra                                         |
| ------------------------- | ------------------------------- | --------------------------------------------- |
| Busca server-side         | `domains/[entidade]/server.ts`  | Usa `fetchServer`, chamado em RSC             |
| Busca client-side         | `domains/[entidade]/client.ts`  | Usa `fetchClient`, chamado via TanStack Query |
| Mutações                  | `domains/[entidade]/actions.ts` | `"use server"`, chamado via `useServerAction` |
| Lógica de UI              | `app/[rota]/components/`        | Componentes específicos da página             |
| Componentes reutilizáveis | `components/`                   | Sem lógica de domínio                         |

### Formatação

O projeto usa **Prettier**. O build (`pnpm build`) executa a formatação automaticamente. Para verificar manualmente:

```bash
pnpm format        # verifica
pnpm format:fix    # corrige
```

---

## Scripts Disponíveis

| Script            | Descrição                                          |
| ----------------- | -------------------------------------------------- |
| `pnpm dev`        | Inicia o servidor de desenvolvimento com Turbopack |
| `pnpm build`      | Formata o código e gera o build de produção        |
| `pnpm start`      | Inicia o servidor de produção                      |
| `pnpm lint`       | Executa o ESLint                                   |
| `pnpm format`     | Verifica a formatação com Prettier                 |
| `pnpm format:fix` | Corrige a formatação com Prettier                  |

## PromoFlow: integração local

O login usa POST /api/auth/login da API NestJS. A home em /control-panel consulta a sessão, exibe o QR Code e lista os grupos do usuário autenticado. Os formulários reutilizam os controllers existentes; as ações de conexão usam Server Actions e as consultas usam TanStack Query.

1. Configure a API em localhost:3333 e aplique as migrations do Prisma.
2. Configure o worker com a URL da API e o mesmo WORKER_API_TOKEN da API.
3. Copie env.example para .env.local e gere um NEXTAUTH_SECRET próprio.
4. Execute pnpm dev no frontend e entre com uma conta cadastrada na API.
5. Na home, clique em Conectar WhatsApp e leia o QR Code pelo celular.

O frontend não recebe o WORKER_API_TOKEN. Ele usa o JWT do usuário, com sessão NextAuth limitada a 24 horas para acompanhar a validade do token da API. Como a API atual não fornece roles ou permissões, a sessão usa o papel member sem conceder privilégios administrativos.

O componente de QR Code usa qrcode.react, pois o template não tinha um gerador de QR. As demais telas reutilizam componentes de UI, formulário, autenticação, ações e consultas existentes.

## Grupo de destino e ofertas manuais

Na home, selecione o grupo padrão no campo controlado e salve. Em Ofertas, use Nova oferta para abrir o FormSheet existente, preencher os dados e conferir a prévia. O grupo padrão vem selecionado, mas pode ser substituído para aquela oferta.

O cadastro usa ControlledSelect, ControlledInput, ControlledInputCurrency e ControlledTextarea; as mutações usam Server Actions e useServerAction. A listagem reutiliza DataTable e usePaginatedList, com chaves centralizadas em queryKeys.offers.

As ofertas são salvas como Prontas. Esta etapa não envia mensagens nem agenda publicações. Não é necessário instalar dependências adicionais.

## Favoritos e cadastro de ofertas

Na home, use a estrela ao lado de cada grupo para adicioná-lo ou removê-lo dos favoritos. Apenas os favoritos aparecem no cadastro de ofertas; se a lista estiver vazia, o formulário orienta a escolher os favoritos na home. O grupo padrão existente é mantido como favorito na atualização.

O cadastro reutiliza ControlledCombobox com busca, padding e borda. O FormSheet de ofertas tem largura ampliada com rolagem vertical, sem alterar o tamanho dos demais sheets do template.

## Agendar e cancelar

Na listagem de Ofertas, use Agendar para reservar o próximo horário disponível do grupo. A coluna Horário previsto mostra a data em America/Sao_Paulo. Cada grupo tem sua própria fila, com intervalo de 2 minutos entre reservas.

Cancelar agendamento mantém a oferta salva como Cancelada; Agendar novamente a coloca no próximo horário disponível. Nenhuma dessas ações envia mensagens nesta etapa. O publicador do worker será integrado depois.

## Resultados de publicação

A listagem de ofertas atualiza automaticamente a cada cinco segundos e exibe horário previsto, data de publicação e observações. Falhas conhecidas permitem Tentar novamente. Um envio sem confirmação aparece como Conferir envio e não disponibiliza reenvio automático.

O publicador precisa ser habilitado no worker local com ENABLE_PUBLISHING=true. A publicação vem desativada por padrão.

Na coluna Agendamento, ofertas com envio sem confirmação mostram Conferir envio. Confira a mensagem no grupo e escolha Chegou ao grupo ou Não foi enviado. A segunda opção permite usar Tentar novamente posteriormente e não dispara reenvio automaticamente.

A tabela informa na Observação quando uma oferta está aguardando envio anterior ou conferência manual do grupo. Em Ações, o botão Editar abre o FormSheet existente para revisar preço, cupom e links antes de agendar ou republicar. Cancele o agendamento antes de editar uma oferta agendada.

Na home, Publicador de ofertas mostra Worker ativo, Envios desativados, Worker sem comunicação ou Aguardando worker, com o horário do último contato. O estado do worker vem da API e é independente da sessão salva do WhatsApp. Sem worker online, a sessão salva não aparece como conexão ativa. Envios interrompidos são resolvidos na tabela por Conferir envio, sem reenvio automático.

No cadastro e na edição, cole o Link do produto e use Buscar dados do link. A busca tenta preencher apenas campos vazios de título, descrição, imagem e preço, mantendo cupom, grupo e link de afiliado. As informações devem ser revisadas antes de salvar. Se a loja bloquear a leitura ou não disponibilizar algum metadado, os campos continuam editáveis manualmente. A busca não salva nem publica mensagens.

### Download da extensão no sistema

A página autenticada `/extension` disponibiliza o ZIP e orienta a instalação manual no Chrome, o atalho e a atualização. O pacote contém apenas os arquivos compilados necessários ao navegador.

Após alterar a extensão, execute `powershell -ExecutionPolicy Bypass -File scripts/package-web.ps1` na pasta `promo-flow-extension`. O comando compila a extensão e atualiza o ZIP versionado e `extension-release.json` em `promo-flow-web/public/downloads`. Inclua esses arquivos no commit e publique novamente o frontend. O build da Vercel usa o pacote já incluído no repositório e não depende da pasta irmã.

### Home pública do PromoFlow

A rota `/` apresenta o produto para visitantes e usuários autenticados, com demonstração ilustrativa, etapas de importação e publicação, recursos e dúvidas frequentes. Os componentes ficam em `src/app/(public)/(landing)/components`. O acesso ao sistema permanece em `/login`, com redirecionamento após autenticação para `/control-panel`. A página explica a dependência do publicador local e usa apenas funcionalidades disponíveis, sem planos ou métricas comerciais fictícias.

### Mascote animado da home

O mascote original é vetorial, com loop de 8 segundos em `public/animations/promoflow-capybara.json`, reproduzido por `lottie-web` carregado apenas no navegador. O componente `capybara-mascot.tsx` substitui o card inicial, oferece pausa, respeita movimento reduzido e destrói o player ao desmontar. A cena mostra captura, conferência e distribuição conceitual entre grupos; seleção automática e conexão a vários grupos estão identificadas como futuras. Para editar formas, cores ou quadros e regenerar o JSON, execute `python scripts/generate-mascot.py`.

### Cadastro de oferta para vários grupos

O sheet de nova oferta e a revisão de produtos da extensão usam o mesmo formulário. Selecione de 1 a 20 grupos favoritos no multiselect com busca. O grupo padrão começa selecionado; o usuário pode trocar os destinos. Salvar sem marcar agendamento cria uma oferta READY por grupo, sem enviar mensagens. A opção "Adicionar a oferta à fila de todos os grupos selecionados" cadastra e agenda todos os destinos em uma única operação; a fila mantém 2 minutos por grupo e pode começar a publicar quando houver worker ativo.

Cada linha da tabela representa um destino, com status, horário, edição e ações independentes. A criação é atômica: qualquer destino inválido ou duplicado cancela o cadastro inteiro e apresenta o erro. O endpoint novo é `POST /api/offers/batch`; publique a API antes do frontend. Não requer migração nem mudanças no worker. O componente ControlledMultiSelect reutiliza o MultiSelect existente com seleção controlada, busca, limite e seleção em conjunto.

### Ofertas agrupadas e destinos expansíveis

A tabela usa `GET /api/offers/grouped`, com paginação por oferta, e mostra produto, preço, quantidade de destinos, resumo dos status e próximo envio. Ao expandir, reutiliza a tabela e as ações por destino: editar, excluir, conferir envio, agendar, cancelar e republicar. Os destinos não são divididos entre páginas. Quando os preços divergem após edições individuais, a linha principal indica "Valores por destino".

As ações gerais pedem confirmação: "Agendar pendentes" inclui somente prontos, cancelados e falhos; publicados e envios em andamento permanecem como estão. "Cancelar pendentes" afeta apenas SCHEDULED. Ambas revalidam o estado na API sob locks e atualizam os contadores da lista. Edições e exclusões individuais não desfazem o agrupamento.

Requer a migração `20261029000000_offer_batches` antes do novo frontend. Publique primeiro a API com `pnpm prisma:deploy`, depois o frontend. O worker mantém o contrato atual. Registros antigos são agrupados conservadoramente quando compartilham usuário, instante de cadastro e dados exatos do produto; cadastros históricos independentes continuam separados.

### Shopee na extensão 0.5.0

A validação do rascunho aceita produtos Shopee Brasil, imagens dos CDNs susercontent.com/Shopee Brasil e links afiliados s.shopee.com.br, shope.ee e shp.ee. A página de instalação e o download acompanham a versão 0.5.0. A revisão continua obrigatória; campos não encontrados ou faixas de preço devem ser conferidos pelo usuário antes de salvar. O contrato do rascunho permanece na versão 1. Publique o frontend para aceitar os novos domínios e a API para reconhecer vendedor + item na proteção de duplicados. Esta integração não cria migração adicional.

## Conexão da extensão 0.6.0

A página pública /extension/connect pede autorização após login no site. A extensão recebe uma credencial própria, limitada à identificação da conexão e à sua revogação; nunca recebe a senha nem o JWT do site. /import-product exige a mesma conta conectada para continuar o rascunho. O administrador pode importar diretamente para o formulário da central; o cadastro só ocorre após revisão e salvar.

A página /extension permite revogar todas as conexões da conta, inclusive após o período de teste. Login e cadastro preservam o retorno à autorização. A nova versão precisa da API atualizada e da migration 20261029030000_extension_connections. O ZIP 0.6.0 está em public/downloads e já é selecionado pelo JSON de versão.

Publicar primeiro a API, depois o frontend; recarregar a extensão dist no Chrome ou substituir pelos arquivos do novo ZIP. A versão 0.6.0 pede identity, storage e acesso às APIs do PromoFlow. Não é necessário publicar na Chrome Web Store para usar o fluxo manual.

## Conexões do WhatsApp

A rota /connections mostra uma conta do WhatsApp por card, com nome, número, status, conexão padrão, grupos sincronizados e quantidade de ofertas na fila. Permite adicionar, renomear, conectar por QR, pausar e retomar envios. O detalhe reaproveita os controles de conexão e favoritos existentes.

No formulário de oferta, a conexão é escolhida antes dos grupos. Trocar a conexão limpa os destinos anteriores, mantendo os demais dados preenchidos. Só são exibidos os favoritos daquela conexão. A tabela de ofertas identifica a conexão e o número associado ao destino. As chaves do React Query isolam detalhes por conexão e atualizam a listagem após alterações.

Esta versão depende da API e do worker com múltiplas conexões. A migration e a ordem de publicação estão documentadas em promo-flow-api/SAAS.md. O frontend não cria sessões no WhatsApp sozinho; o worker local precisa estar ativo.
