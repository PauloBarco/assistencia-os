# Guia de Deploy - Assistência OS

## Plataforma Recomendada: Vercel

A Vercel é a plataforma oficial do Next.js e oferece deploy automático com configuração mínima.

---

## Variáveis de Ambiente

Para produção, configure as seguintes variáveis na Vercel:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão do banco PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `APP_ADMIN_USERNAME` | Usuário admin padrão | `admin` |
| `APP_ADMIN_PASSWORD` | Senha admin padrão | `admin123` |
| `SESSION_SECRET` | Chave secreta para sessões | `sua-chave-secreta-aqui` |

---

## Deploy na Vercel

### Opção 1: Via Git (Recomendado)

1. **Conecte o repositório:**
   - Acesse https://vercel.com/new
   - Importe seu repositório GitHub/GitLab/Bitbucket

2. **Configure as variáveis:**
   - Em "Environment Variables", adicione:
     ```
     DATABASE_URL=postgresql://postgres:qgYLW81HeQycboR6@db.zvzvobmokluqcruomifi.supabase.co:5432/postgres
     APP_ADMIN_USERNAME=admin
     APP_ADMIN_PASSWORD=admin123
     SESSION_SECRET=sua-chave-secreta-aqui
     ```

3. **Deploy:**
   - Clique em "Deploy"
   - Aguarde ~2 minutos

### Opção 2: Via CLI

```bash
# Instale a CLI
npm i -g vercel

# Entre no projeto
cd assistencia-os

# Deploy interativo
vercel
```

Siga as instruções na tela para configurar as variáveis.

---

## Após o Deploy

1. **Verifique o banco:**
   - O banco Supabase deve estar ativo
   - Configure o `DATABASE_URL` correto na Vercel

2. **Execute migrations:**
   ```bash
   npx prisma migrate deploy
   ```

3. **Execute seed (primeira vez):**
   ```bash
   npx prisma db seed
   ```

---

## Configuração de Domínio (Opcional)

1. Vá em **Settings → Domains** na Vercel
2. Adicione seu domínio (ex: `assistencia.com.br`)
3. Configure os registros DNS conforme instruído

---

## Troubleshooting

### Erro: "Can't reach database server"
- Verifique se o banco Supabase está ativo
- Confirme que o `DATABASE_URL` está correto nas variáveis da Vercel

### Erro: 500 ao fazer login
- Execute `npx prisma db seed` para criar o usuário admin
- Verifique as variáveis de ambiente

---

## Alternativas de Deploy

| Plataforma | Prós | Contras |
|------------|------|----------|
| **Vercel** | Oficial Next.js, deploy rápido | Limite gratuito em projetos |
| **Netlify** | Deploy simples, Functions | Menos otimizado para Next.js |
| **Railway** | Flexível, pricing justo | Configuração manual |
| **Render** | Bom para Node.js | Cold starts |

---

_Atualizado em: 28 de abril de 2026_