# Preparação para Atualização do Prisma 5 → 7

## ⚠️ Aviso Importante

O Prisma deu um salto da versão **5.22.0 para 7.8.0**. Esta é uma atualização **major** com vários breaking changes.

---

## Análise do Projeto Atual

### Schema Prisma (`prisma/schema.prisma`)
- ✅ Usa `provider = "prisma-client-js"` — **precisa alterar para `prisma-client`**
- ❌ Não tem `output` definido — **obrigatório no v7**
- ✅ Usa PostgreSQL — **precisa de driver adapter**
- ✅ Usa enums com `@map` — comportamento revertido no v7 (compatível)

### Código Fonte
- `lib/prisma.ts`: Usa `import { PrismaClient } from "@prisma/client"` — **precisa alterar caminho**
- `prisma/seed.ts`: Usa `import { PrismaClient } from "@prisma/client"` — **precisa alterar caminho**

### Testes
- 10 arquivos de teste usam mock do Prisma
- Não devem precisar de alterações significativas

---

## Breaking Changes do Prisma 7

### 1. ESM Obrigatório
```json
// package.json
"type": "module"
```

### 2. Novo Provider e Output
```prisma
// schema.prisma
generator client {
  provider = "prisma-client"  // antes: prisma-client-js
  output = "./generated/prisma"  // OBRIGATÓRIO
}
```

### 3. Novo Caminho de Import
```typescript
// Antes
import { PrismaClient } from "@prisma/client"

// Depois
import { PrismaClient } from "./generated/prisma/client"
```

### 4. Driver Adapter Obrigatório (PostgreSQL)
```typescript
import { PrismaClient } from "./generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({ adapter })
```

### 5. Prisma Config Obrigatório
```typescript
// prisma.config.ts
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
})
```

### 6. dotenv Obrigatório
```bash
npm install dotenv
```

### 7. seed manual
```bash
# Antes (v6): automático após migrate
# Depois (v7): explícito
npx prisma db seed
```

### 8. Remoções
- `$use` (middleware) — usar `$extends`
- Métricas removidas
- Flags CLI removidos: `--skip-generate`, `--skip-seed`

---

## Checklist de Atualização

### Antes da Atualização
- [ ] Fazer backup do banco de dados
- [ ] Fazer backup do `package.json`
- [ ] Documentar versão atual das dependências

### Atualização de Pacotes
- [ ] `npm install @prisma/client@7 prisma@7`
- [ ] `npm install dotenv`
- [ ] `npm install @prisma/adapter-pg pg`

### Alterações no Schema
- [ ] Alterar `provider = "prisma-client"`
- [ ] Adicionar `output = "./generated/prisma"`
- [ ] Criar `prisma.config.ts`

### Alterações no Código
- [ ] Atualizar imports em `lib/prisma.ts`
- [ ] Atualizar imports em `prisma/seed.ts`
- [ ] Implementar driver adapter para PostgreSQL

### Após Atualização
- [ ] `npx prisma generate`
- [ ] `npx prisma db push` ou `migrate`
- [ ] `npx prisma db seed`
- [ ] Executar testes: `npm test`
- [ ] Testar aplicação manualmente

---

## Comandos de Atualização

```bash
# 1. Backup
cp package.json package.json.backup

# 2. Instalar novas versões
npm install @prisma/client@7 prisma@7 -D

# 3. Instalar dependências adicionais
npm install dotenv @prisma/adapter-pg pg

# 4. Gerar novo client
npx prisma generate

# 5. Aplicar schema (sem perder dados)
npx prisma db push

# 6. Seed manual
npx prisma db seed
```

---

## ✅ Status da Atualização

### Concluído em 27/04/2026:

- [x] `npm install @prisma/client@7 prisma@7 -D`
- [x] `npm install dotenv @prisma/adapter-pg pg`
- [x] Alterado `provider = "prisma-client"`
- [x] Adicionado `output = "../generated/prisma"`
- [x] Criado `prisma.config.ts`
- [x] Removido `url` do datasource no schema
- [x] Atualizado imports em todos os arquivos
- [x] Implementado driver adapter em `lib/prisma.ts`
- [x] `npx prisma generate` ✓
- [x] `npm run build` ✓

### ⚠️ Pendente:
- Testes unitários precisam de ajuste na estrutura de mocks
- Executar `npx prisma db push` ou `migrate` (requer banco)
- Executar `npx prisma db seed` (requer banco)

---

## Riscos Identificados

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Quebra de imports | Alto | Atualizar todos os arquivos que importam PrismaClient |
| Driver adapter config | Médio | Testar conexão com banco após update |
| SSL certificates | Médio | Configurar `ssl: { rejectUnauthorized: false }` se necessário |
| seed automático | Baixo | Executar `npx prisma db seed` manualmente |

---

## Recomendação

**Não recomendo atualização imediata para Prisma 7** devido:
1. Mudanças significativas na arquitetura
2. Necessidade de driver adapter
3. Possíveis ajustes de SSL com banco de dados
4. Novo sistema de configuração

**Sugestão**: Atualizar primeiro para **Prisma 6.x** (última versão 6.x) que deve ser mais compatível, depois avaliar migração para 7.

---

_Documento gerado em: 27 de abril de 2026_
_Versão atual: Prisma 5.22.0_