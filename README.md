# KeyCabinet

Веб-приложение учёта выдачи ключей офисных кабинетов.

**Студент:** Шамиль Зарипов  
**Дисциплина:** Методы искусственного интеллекта · ДЗ5 (Backend + Frontend)  
**Стек:** React 19, Vite, TypeScript, Tailwind CSS v4, Vitest, Supabase

## Функции MVP

1. Список ключей со статусами (свободен / выдан / просрочен)
2. Выдача ключа сотруднику по ФИО (+ запись в `checkouts`)
3. Возврат ключа, фильтр/поиск
4. Auth (email/password) + RLS при подключении Supabase
5. Demo-режим без `.env` (локальный Run в Rider всё ещё работает)

## Rider

Проект: `~/RiderProjects/KeyCabinet/` (`package.json` в корне).

1. Run Configuration **npm: dev** → **Run ▶**
2. Откройте `http://localhost:5173`
3. Конфигурация **npm: test** — прогон Vitest

## Быстрый старт (без Supabase)

```bash
npm install
npm run dev
npm test
```

Без `VITE_SUPABASE_*` включается demo-режим (баннер на экране, данные в памяти).

## Подключение Supabase (live)

1. Создайте проект на [supabase.com](https://supabase.com).
2. **SQL Editor** → выполните `supabase/migrations/001_init.sql`.
3. **Auth → Providers → Email**: включить; для учёбы можно отключить Confirm email.
4. **Auth → URL Configuration**: Site URL `http://localhost:5173`.
5. **Settings → API**: скопируйте URL и `anon` key.
6. ```bash
   cp .env.example .env.local
   # вставьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
   npm run dev
   ```
7. В UI нажмите **Регистрация**, затем работайте с ключами.

Реальные секреты **не коммитить** (`.env.local` в `.gitignore`).

Подробности: [`backend_documentation.md`](./backend_documentation.md).

## Тесты

```bash
npm test
```

Юнит-тесты (Vitest + Testing Library) покрывают:

- утилиты выдачи/возврата/фильтра
- нормализацию ошибок 401/403/500
- API-слой в demo и с mock-клиентом Supabase
- UI (фильтр, выдача, валидация, demo-баннер)

Live Supabase для `npm test` **не нужен**. Опциональная ручная проверка: при наличии `.env.local` зарегистрируйтесь в UI и выдайте/верните ключ.

## Сборка и будущий деплой (Vercel)

```bash
npm run build
npm run preview
```

На Vercel: Framework Vite; env `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; в Supabase Redirect URLs — URL деплоя.

## Структура

- `src/api` — Auth + keys API (Supabase / demo)
- `src/lib` — клиент Supabase, `apiErrors`
- `src/components` — UI + AuthPanel
- `src/data` — seed mock для demo
- `supabase/migrations` — SQL + RLS
- `backend_documentation.md` — архитектура, API, деплой
- `.env.example` — шаблон переменных

## Сдача ДЗ5

Пакет на Desktop: `~/Desktop/МИИ Зарипов/5/` (отчёт + `submission/`).
