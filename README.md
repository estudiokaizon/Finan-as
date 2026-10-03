# Minhas Finanças

App pessoal de finanças do Anthony — substitui a planilha. Mostra em poucos toques quanto entrou no mês, o que separar primeiro (reserva, investimentos, dízimo), quanto vai para gastos fixos/assinaturas/parcelas, quanto ainda dá para gastar no dia a dia, e se o mês está dentro da meta de gastos.

Todos os dados ficam **só no seu aparelho** (IndexedDB, via Dexie.js) — não existe login nem servidor. Por isso é importante tirar backups de vez em quando (veja a seção de Backup abaixo).

## Rodando localmente

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Outros comandos úteis:

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build de produção localmente, para testar o PWA
npm run test       # roda os testes automatizados (Vitest)
npm run lint       # checagem de lint
```

## Deploy na Vercel (passo a passo)

A Vercel tem plano gratuito e é a forma mais simples de colocar o app no ar com HTTPS (necessário para o PWA funcionar e ser instalável no iPhone).

### Opção A — pelo site da Vercel (sem usar terminal)

1. Suba este projeto para um repositório no GitHub (crie um repositório novo e faça o push desta pasta).
2. Entre em [vercel.com](https://vercel.com) e crie uma conta gratuita (pode usar login do GitHub).
3. Clique em **Add New → Project**, escolha o repositório que você acabou de subir.
4. A Vercel detecta automaticamente que é um projeto Vite. Não precisa mudar nenhuma configuração:
   - **Build Command**: `npm run build` (já vem preenchido)
   - **Output Directory**: `dist` (já vem preenchido)
5. Clique em **Deploy** e aguarde. Em cerca de 1 minuto você recebe uma URL tipo `https://minhas-financas-xxxx.vercel.app`.
6. Pronto — a cada novo `git push`, a Vercel atualiza o site sozinha.

### Opção B — pelo terminal (CLI da Vercel)

```bash
npm install -g vercel
vercel login
vercel          # primeiro deploy (ambiente de preview)
vercel --prod   # publica em produção
```

Siga as perguntas no terminal (nome do projeto, diretório — pode aceitar os padrões).

## Instalando no iPhone (tela inicial)

1. Abra a URL do app publicado no **Safari** do iPhone (precisa ser o Safari, não funciona pelo app da Vercel/preview).
2. Toque no ícone de **Compartilhar** (quadrado com seta para cima).
3. Toque em **Adicionar à Tela de Início**.
4. Confirme o nome ("Finanças") e toque em **Adicionar**.

O app abre em tela cheia, sem a barra do Safari, com ícone próprio — e continua funcionando mesmo sem internet (os dados já carregados ficam disponíveis offline).

## Backup dos dados

Como os dados vivem só no aparelho, **se você desinstalar o app, trocar de celular ou limpar os dados do navegador, os lançamentos somem**. Para não perder nada:

- Vá em **Ajustes → Exportar todos os dados (JSON)** de vez em quando (por exemplo, toda virada de mês) e guarde o arquivo em algum lugar seguro (iCloud, e-mail para você mesmo, etc.).
- Para restaurar, use **Ajustes → Importar dados (JSON)** com um arquivo exportado anteriormente — isso substitui todos os dados atuais pelos do arquivo.
- **Ajustes → Exportar lançamentos (CSV)** gera uma planilha só com os lançamentos do dia a dia, útil para abrir no Excel/Numbers/Google Sheets.

## Estrutura do projeto

```
src/
  lib/          cálculos financeiros, banco (Dexie), hooks reativos, backup
  data/seed.ts  dados iniciais de exemplo (outubro/2026)
  components/   peças reutilizáveis de interface (modal, gráficos, etc.)
  screens/      as 5 telas do app (Painel, Orçamento, Metas, Histórico, Ajustes)
```

As regras de cálculo (seção 5 da spec original) estão em `src/lib/calculos.ts`, com testes automatizados em `src/lib/calculos.test.ts` conferindo os números batendo exatamente com os valores esperados.
