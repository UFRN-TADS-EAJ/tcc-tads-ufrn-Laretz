# Título do Projeto de pesquisa ou TCC

Repositório técnico do projeto de pesquisa desenvolvido no curso de **Análise e Desenvolvimento de Sistemas**.

Repositório técnico do Trabalho de Conclusão de Curso (TCC) do curso de **Análise e Desenvolvimento de Sistemas**.

Este repositório deve conter exclusivamente artefatos técnicos do projeto:

* código-fonte
* notebooks (quando aplicável)
* scripts de execução
* modelos treinados (quando aplicável)
* documentação técnica mínima
* instruções de instalação e execução

O texto monográfico do TCC não precisa ser incluído neste repositório, no entanto, é interessante incluir um link para o respositório institucional da UFRN.

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


Criar ambiente virtual:

```
python -m venv venv
```

Ativar ambiente:

Linux/macOS:

```
source venv/bin/activate
```

Windows:

```
venv\Scripts\activate
```

Instalar dependências:

```
pip install -r requirements.txt
```

---

# Execução do Projeto

Executar treinamento (quando aplicável):

```
python train.py
```

Executar aplicação (quando aplicável):

```
### Desenvolvimento
- Backend: `cd backend && npm run dev`
- Front-end: `cd front-end && npm run dev`
```

ou

```
uvicorn main:app
```

---

# Dataset (quando aplicável)

Informar:

* nome
* origem
* link
* instruções de download

Caso não esteja no repositório, descrever como obter.

---

# Deploy

## Execução local
- Subir banco + backend + front conforme instruções de “Instalação” e “Execução”.


```
streamlit run app.py
```

ou

```
python main.py
```

## Execução com Docker (quando aplicável)

```
docker build -t nome-projeto .
docker run -p 8000:8000 nome-projeto
```

## Execução em servidor (quando aplicável)

Descrever:

* plataforma utilizada
* etapas principais de implantação
* dependências necessárias

---

# Reprodutibilidade

Para reproduzir o ambiente:

```
git clone <url-do-repositorio>
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


