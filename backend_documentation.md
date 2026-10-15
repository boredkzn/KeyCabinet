# Backend documentation — KeyCabinet (ДЗ5)

**Студент:** Шамиль Зарипов  
**Стек:** React (Vite) + Supabase (PostgreSQL, Auth, PostgREST, RLS)  
**Live demo:** https://key-cabinet.vercel.app  
**См. также:** [README.md](./README.md) · [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) · [`.env.example`](./.env.example)

## 1. Архитектура

```
Browser (Vite/React)
    │  @supabase/supabase-js
    │  HTTPS + JWT (anon key + user session)
    ▼
Supabase Cloud
  ├─ Auth (email/password)
  ├─ PostgREST → PostgreSQL (office_keys, checkouts, profiles)
  └─ RLS policies (только authenticated)
```

Выбран **вариант A: Supabase BaaS** (без self-hosted Postgres/Docker/VPS):

| Критерий | Supabase | Self-hosted |
|----------|----------|-------------|
| Время старта | минуты | часы (VPS, Docker, TLS) |
| Auth + RLS | из коробки | писать middleware |
| PostgREST API | автогенерация | отдельный сервис |
| Стоимость для ДЗ | Free tier | аренда сервера |
| CORS | по умолчанию ок | настраивать |

Для учебного fullstack-ДЗ и последующего деплоя фронта на Vercel BaaS достаточен и проще в сопровождении.

## 2. Схема БД

Миграция: `supabase/migrations/001_init.sql`

| Таблица | Назначение |
|---------|------------|
| `profiles` | профиль пользователя (`auth.users`) |
| `office_keys` | ключи кабинетов и текущий статус |
| `checkouts` | история выдач/возвратов |

Связи: `checkouts.key_id → office_keys.id`, `profiles.id → auth.users.id`, `checkouts.issued_by → auth.users.id`.

## 3. Развёртывание Supabase

1. Зарегистрироваться на [https://supabase.com](https://supabase.com), **New project**.
2. Дождаться готовности БД.
3. **SQL Editor** → вставить содержимое `001_init.sql` → **Run**.
4. **Authentication → Providers → Email**: включить Email; для учёбы можно отключить Confirm email.
5. **Authentication → URL Configuration**: Site URL = `http://localhost:5173` (позже URL Vercel).
6. **Project Settings → API**: скопировать Project URL и `anon` `public` key.
7. В корне проекта: `cp .env.example .env.local` и вставить значения.
8. `npm install && npm run dev`.

Без `.env.local` приложение работает в **demo-режиме** (данные в памяти, баннер на экране).

### Что должен сделать студент вручную (логин)

Агент не может создать проект от вашего аккаунта. Нужно:

1. Войти в Supabase Dashboard.
2. Создать проект.
3. Выполнить SQL-миграцию.
4. Заполнить `.env.local`.
5. Зарегистрировать пользователя через UI приложения (кнопка «Регистрация»).

## 4. API (PostgREST)

Базовый URL: `{VITE_SUPABASE_URL}/rest/v1/`  
Заголовки: `apikey: <anon>`, `Authorization: Bearer <access_token>`, `Content-Type: application/json`.

### Минимум 3 CRUD-операции

| Операция | Метод | Endpoint | Описание |
|----------|-------|----------|----------|
| Read | `GET` | `/office_keys?select=*&order=room` | список ключей |
| Update (issue) | `PATCH` | `/office_keys?id=eq.k-101&status=eq.available` | выдача |
| Create | `POST` | `/checkouts` | запись в историю |
| Update (return) | `PATCH` | `/office_keys?id=eq.k-205` | возврат + закрытие checkout |

Пример чтения (curl):

```bash
curl "$VITE_SUPABASE_URL/rest/v1/office_keys?select=id,room,status,holder&order=room" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Пример выдачи:

```bash
curl -X PATCH "$VITE_SUPABASE_URL/rest/v1/office_keys?id=eq.k-101&status=eq.available" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status":"issued","holder":"Иванов А.П.","issued_at":"2026-10-15T12:00:00Z"}'
```

Клиентский слой: `src/api/keysApi.ts`, `src/api/authApi.ts`.

## 5. Безопасность

- **Auth:** email + password (Supabase Auth).
- **RLS:** на всех таблицах; CRUD по `office_keys`/`checkouts` только для `authenticated`.
- **Секреты:** только `anon` key на клиенте; service_role не используется и не коммитится.
- **CORS:** стандартный для Supabase; отдельные заголовки не нужны.
- **`.env` / `.env.local` в `.gitignore`**.

Без сессии запросы к таблицам получают **401/403** — UI показывает понятные баннеры.

## 6. Обработка ошибок

`src/lib/apiErrors.ts` нормализует:

| Код | UI |
|-----|-----|
| 401 | «Требуется вход…» |
| 403 | «Доступ запрещён… RLS…» |
| 500 | «Ошибка сервера… Logs в Dashboard» |
| сеть | «Нет связи с сервером…» |
| валидация | текст правила (пустое ФИО и т.п.) |

Логи: **Supabase → Logs → API / Postgres / Auth**. Промпт для AI: вставить фрагмент лога + SQL policy и попросить найти причину 403/500.

## 7. Тестирование

```bash
npm test
```

Юнит-тесты работают **без live Supabase** (mock / demo). При наличии `.env.local` можно вручную проверить e2e в браузере после регистрации.

## 8. Деплой фронта (Vercel)

Полный чеклист: [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md). Кратко:

1. Репозиторий на GitHub (`main`) → Import в Vercel, Framework: **Vite**.
2. Environment Variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. В Supabase Redirect URLs добавить production URL (сейчас: `https://key-cabinet.vercel.app`) и при необходимости `http://localhost:5173`.
4. Deploy / Redeploy после изменения env.

## 9. Процесс разработки с AI

1. Описание сущностей KeyCabinet → генерация SQL + RLS.
2. Генерация клиента `@supabase/supabase-js` и хуков выдачи/возврата.
3. Промпты на обработку 401/403/500 и demo-fallback.
4. Расширение Vitest (mock client, apiErrors).
5. Документация и отчёт по шагам ДЗ5.

Использовались Cursor Agent + правила `.cursorrules` проекта.
