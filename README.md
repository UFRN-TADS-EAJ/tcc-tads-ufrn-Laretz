# Projeto de Alocação Acadêmica

Repositório técnico do projeto de pesquisa desenvolvido no curso de **Análise e Desenvolvimento de Sistemas**.

Repositório técnico do Trabalho de Conclusão de Curso (TCC) do curso de **Análise e Desenvolvimento de Sistemas**.

Este repositório deve conter exclusivamente artefatos técnicos do projeto:

* código-fonte
* scripts de execução
* documentação técnica mínima
* instruções de instalação e execução

---

# Identificação do Projeto

Aluno(a): Renato Ramon de Carvalho Nobre Albuquerque

E-mail: renatophoenix123@gmail.com

Orientador: Antonino Alves Feitosa Neto


Semestre/Ano: 2026.1

Descrição do Projeto: Sistema web para auxiliar coordenação do TADS no processo de gerenciamento das alocações acadêmicas dentro da EAJ, organizando informações das turmas, docentes, horários e espaços físicos.

# Tecnologias Utilizadas

Linguagem principal: TypeScript (frontend e backend)

Bibliotecas / Frameworks: (apenas uma lista de exemplos)

```
- Front-end: Next.js (App Router), React, Tailwind CSS, shadcn/ui (Radix), Zustand, React Hook Form, Zod, Axios
- Back-end: Node.js, Fastify, Prisma ORM, Zod, JWT, Vitest/Supertest
- Banco de dados: PostgreSQL
```

Ferramentas:

```
- Git
- Docker 
- Prisma Migrate / Prisma Studio
```

---

# Estrutura do Repositório

Exemplo:

```
/backend                  API (Fastify + Prisma)
  /prisma                 schema e migrations
  /src
    /http                 controllers, rotas, middlewares
    /use-cases            regras de negócio (casos de uso)
    /repositories         acesso a dados (interfaces + Prisma/In-memory)
    /schemas              schemas Zod (contratos)
    /algorithms           alocação automática / algoritmo genético
    /tests                testes unit e e2e
/front-end                Aplicação web (Next.js)
  /src
    /app                  páginas (App Router)
    /components           componentes e features
    /hooks                hooks de orquestração
    /services             camada de acesso à API
    /lib                  integrações centrais (axios, etc.)
    /store                estado global (auth)
    /types                tipos e view-models
    /utils                utilitários puros
```

---

# Requisitos do Sistema

```
- Node.js 18+
- npm 9+
- PostgreSQL 14+ (ou Docker)
- Docker/Docker Compose (opcional, se não tiver PostgreSQL instalado)
```

---

# Instalação

## 1) Clonar o repositório:

```
git clone <url-do-repositorio>
cd tcc
```

## 2) Backend (API)

1. Instalar dependências:
```bash
cd backend
npm install
```

2. Configurar variáveis de ambiente:
- Crie `backend/.env` baseado em `backend/.env.example`.

3. Subir o banco:
- Com Docker (recomendado):
```bash
docker compose up -d
```

4. Rodar migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Iniciar API:
```bash
npm run dev
```
A API sobe por padrão em: `http://localhost:3333`

## 3) Front-end (Web)

1. Instalar dependências:
```bash
cd ../front-end
npm install
```

2. Configurar variáveis de ambiente:
- Crie `front-end/.env.local` baseado em `front-end/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

3. Iniciar o front:
```bash
npm run dev
```

Acesse: `http://localhost:3000`

---


# Scritps do projeto: 

```
npm run setup:horarios -> popula o banco com a tabela de horarios da ufrn
npm run seed  -> popula o banco com alguns dados para testar o sistema
npm run test:e2e  -> roda todos os testes e2e
npm run test:unit -> roda todos os testes unitarios

```

Instalar dependências:

```
npm i
```

---

# Execução do Projeto

Executar aplicação:

```
### Desenvolvimento
- Backend: `cd backend && npm run dev`
- Front-end: `cd front-end && npm run dev`
```

# Deploy

## Execução local
- Subir banco + backend + front conforme instruções de “Instalação” e “Execução”.

## Execução com Docker

```
docker compose up -d
```

# Reprodutibilidade

Para reproduzir o ambiente:

```
git clone https://github.com/UFRN-TADS-EAJ/tcc-tads-ufrn-Laretz.git
cd 1tcc
cd backend
npm install
# configure backend/.env com base no .env.example
docker compose up -d
npx prisma migrate dev
npm run dev

cd ../front-end
npm install
# configure front-end/.env.local com base no .env.example
npm run dev

```


