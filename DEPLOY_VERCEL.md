# KeyCabinet → Vercel (чеклист)

Клиентский Vite SPA. `vercel.json` не нужен. Секреты только в Vercel Env / локальном `.env.local` — не в Git.

## 1. Репозиторий

Уже на GitHub: https://github.com/boredkzn/KeyCabinet  
Ветка: `main`.

## 2. Импорт в Vercel

1. Откройте [vercel.com](https://vercel.com) → **Log in** → **Continue with GitHub** (аккаунт `boredkzn` / доступ к репо).
2. **Add New…** → **Project** → **Import** репозиторий **KeyCabinet**.
3. Framework Preset: **Vite** (или оставьте автодетект).
4. Build Command: `npm run build` · Output Directory: `dist` · Install: `npm install` (обычно уже подставлено).
5. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL` — из вашего `.env.local`
   - `VITE_SUPABASE_ANON_KEY` — из вашего `.env.local`
6. **Deploy**.

## 3. После деплоя

1. Скопируйте URL вида `https://….vercel.app`.
2. Supabase Dashboard → **Authentication** → **URL Configuration**:
   - **Site URL** = ваш Vercel URL
   - **Redirect URLs** = тот же URL (и при необходимости `http://localhost:5173` для локальной разработки)
3. Проверьте сайт: регистрация/вход и список ключей (после миграции SQL из `supabase/migrations/001_init.sql`).

## Локально (напоминание)

```bash
cp .env.example .env.local   # заполнить своими значениями
npm install
npm test
npm run build
npm run dev
```

Не коммитьте `.env.local`. Шаблон переменных — только в `.env.example`.
