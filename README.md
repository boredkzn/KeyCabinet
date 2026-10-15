# KeyCabinet

**RU:** Веб-приложение учёта выдачи ключей офисных кабинетов. Курсовое задание **ДЗ5** (МИИ) — fullstack: React-клиент + backend на Supabase.

**EN:** Office key checkout tracker — homework **HW5** (AI Methods): React frontend with Supabase (Postgres, Auth, RLS, PostgREST).

| | |
|---|---|
| **Студент / Author** | Шамиль Зарипов |
| **Дисциплина** | Методы искусственного интеллекта · ДЗ5 |
| **Live demo** | https://key-cabinet.vercel.app |
| **Репозиторий** | https://github.com/boredkzn/KeyCabinet |

## Стек / Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4
- **Backend:** Supabase — PostgreSQL, Auth (email/password), Row Level Security (RLS), PostgREST
- **Tests:** Vitest + Testing Library (~25 tests)
- **Deploy:** GitHub → [Vercel](https://vercel.com) (SPA)

## Возможности / Features

1. Список ключей со статусами: свободен / выдан / просрочен  
2. Выдача ключа сотруднику по ФИО (+ запись в `checkouts`)  
3. Возврат ключа, поиск и фильтр по статусу  
4. Auth + RLS при подключении Supabase  
5. **Demo-режим** без `.env` — приложение работает локально на данных в памяти  

## Быстрый старт / Local run

```bash
npm install
cp .env.example .env.local   # опционально — без этого включится demo-режим
npm run dev                  # http://localhost:5173
```

| Команда | Описание |
|---------|----------|
| `npm run dev` | dev-сервер Vite |
| `npm test` | Vitest (~25 тестов) |
| `npm run build` | production-сборка в `dist/` |
| `npm run preview` | превью сборки |

Реальные секреты **не коммитить** — шаблон только в [`.env.example`](./.env.example).

### Rider

Проект: `~/RiderProjects/KeyCabinet/` (`package.json` в корне).  
Run Configuration **npm: dev** → Run ▶ → `http://localhost:5173`.

## База данных / Database

Миграция: [`supabase/migrations/001_init.sql`](./supabase/migrations/001_init.sql)

| Таблица | Назначение |
|---------|------------|
| `office_keys` | ключи кабинетов и текущий статус |
| `checkouts` | история выдач / возвратов |
| `profiles` | профиль пользователя (`auth.users`) |

### Как применить миграцию

1. Создайте проект на [supabase.com](https://supabase.com).
2. **SQL Editor** → вставьте содержимое `001_init.sql` → **Run**.
3. **Auth → Providers → Email**: включить (для учёбы можно отключить Confirm email).
4. **Auth → URL Configuration**: Site URL `http://localhost:5173` (и URL Vercel после деплоя).
5. **Settings → API**: скопируйте Project URL и `anon` key в `.env.local`.
6. `npm run dev` → в UI **Регистрация** → работа с ключами.

Подробности API, RLS и curl-примеры: [`backend_documentation.md`](./backend_documentation.md).

## Тесты / Tests

```bash
npm test
```

**Vitest** (~25 тестов) покрывает:

- утилиты выдачи / возврата / фильтра (`keyActions`)
- нормализацию ошибок 401 / 403 / 500 (`apiErrors`)
- API-слой в demo и с mock-клиентом Supabase (`keysApi`)
- UI: фильтр, выдача, валидация ФИО, demo-баннер (`App`, `StatusBadge`)

Live Supabase для `npm test` **не нужен**.

## Деплой / Deploy

Продакшен: **https://key-cabinet.vercel.app**

Кратко: импорт репозитория в Vercel (Framework **Vite**), env:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Полный чеклист (Redirect URLs в Supabase, Preview/Production): [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md).

## Документация / Docs

| Файл | Содержание |
|------|------------|
| [`backend_documentation.md`](./backend_documentation.md) | архитектура, схема БД, PostgREST, RLS, ошибки |
| [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md) | чеклист деплоя на Vercel |
| [`.env.example`](./.env.example) | шаблон переменных окружения |
| [`docs/technical_specification.md`](./docs/technical_specification.md) | ТЗ (ДЗ4) |
| [`docs/development_report.md`](./docs/development_report.md) | отчёт по процессу разработки |
| [`docs/Отчет_ДЗ5_Зарипов.docx`](./docs/Отчет_ДЗ5_Зарипов.docx) | отчёт ДЗ5 (Word) |

## Структура проекта / Project structure

```
KeyCabinet/
├── index.html              # точка входа Vite
├── package.json            # скрипты и зависимости (корень = Vercel root)
├── vite.config.ts
├── .env.example
├── README.md
├── DEPLOY_VERCEL.md
├── backend_documentation.md
├── docs/                   # ТЗ, отчёты ДЗ
├── public/                 # статика
├── scripts/                # генерация Word-отчёта
├── supabase/
│   └── migrations/
│       └── 001_init.sql    # таблицы + RLS + seed
└── src/
    ├── api/                # Auth + keys API (Supabase / demo)
    ├── components/         # UI (KeyCard, Toolbar, AuthPanel…)
    ├── data/               # seed mock для demo
    ├── lib/                # supabase client, apiErrors
    ├── types/
    ├── utils/              # issue / return / filter
    ├── test/               # setup Vitest
    ├── App.tsx
    └── main.tsx
```

## Сдача ДЗ5

Пакет на Desktop: `~/Desktop/МИИ Зарипов/5/` (отчёт + `submission/`).
