# KeyCabinet → Vercel (чеклист)

Клиентский Vite SPA. `vercel.json` не нужен — корень репозитория = корень деплоя (`package.json` рядом с `index.html`).  
Секреты только в Vercel Env / локальном `.env.local` — **не в Git**.

**Live:** https://key-cabinet.vercel.app  
**Repo:** https://github.com/boredkzn/KeyCabinet (`main`)

## 1. Репозиторий

Ветка для деплоя: `main`. После `git push` Vercel подхватит коммит автоматически (если проект уже связан).

## 2. Импорт в Vercel (первый раз)

1. Откройте [vercel.com](https://vercel.com) → **Log in** → **Continue with GitHub**.
2. **Add New…** → **Project** → **Import** репозиторий **KeyCabinet**.
3. Framework Preset: **Vite** (или автодетект).
4. Build Command: `npm run build` · Output Directory: `dist` · Install: `npm install`.
5. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL` — из вашего `.env.local` / Supabase → Settings → API
   - `VITE_SUPABASE_ANON_KEY` — `anon` `public` key (не `service_role`)
6. **Deploy**.

## 3. После деплоя

1. Скопируйте URL вида `https://….vercel.app` (или кастомный домен).
2. Supabase Dashboard → **Authentication** → **URL Configuration**:
   - **Site URL** = production URL (например `https://key-cabinet.vercel.app`)
   - **Redirect URLs** = тот же URL + `http://localhost:5173` для локальной разработки
3. Убедитесь, что выполнена миграция [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql).
4. Проверьте: регистрация / вход и список ключей.

## Локально (напоминание)

```bash
cp .env.example .env.local   # заполнить своими значениями
npm install
npm test
npm run build
npm run dev
```

Шаблон переменных: [`.env.example`](./.env.example).  
Архитектура и API: [`backend_documentation.md`](./backend_documentation.md).
