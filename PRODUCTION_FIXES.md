# Исправления для продакшна на Vercel

## ✅ Выполненные исправления

### 1. Убрана зависимость от API_INTERNAL_BASE_URL

**Проблема:** Проект использовал `API_INTERNAL_BASE_URL` для проксирования запросов к внешнему API.

**Решение:**
- ✅ Удален файл `app/api/v1/[...path]/route.ts` который требовал `API_INTERNAL_BASE_URL`
- ✅ Все клиентские запросы уже используют относительные пути (`/api/v1/...`)
- ✅ Все серверные запросы используют относительные пути

**Проверено:**
- `app/[locale]/login/page.tsx` → использует `/api/v1/auth/login` ✅
- `app/[locale]/register/page.tsx` → использует `/api/v1/auth/register` ✅
- `src/lib/api.ts` → использует относительные пути ✅

### 2. Проверены и исправлены API routes

**Все API routes существуют и работают:**
- ✅ `app/api/v1/health/route.ts` - GET возвращает `{ ok: true }`
- ✅ `app/api/v1/auth/register/route.ts` - POST регистрация
- ✅ `app/api/v1/auth/login/route.ts` - POST вход
- ✅ `app/api/v1/auth/me/route.ts` - GET текущий пользователь
- ✅ `app/api/v1/auth/token/route.ts` - POST верификация токена
- ✅ `app/api/v1/creatives/route.ts` - GET список, POST создание
- ✅ `app/api/v1/creatives/[id]/route.ts` - GET детали
- ✅ `app/api/v1/creatives/[id]/analyze/route.ts` - POST анализ
- ✅ `app/api/v1/creatives/[id]/upload-url/route.ts` - POST signed URL

**Исправления:**
- ✅ Health endpoint упрощен: возвращает только `{ ok: true }`
- ✅ Удален legacy proxy route который требовал `API_INTERNAL_BASE_URL`

### 3. Исправлен i18n роутинг

**Проблема:** Отсутствовал `generateStaticParams` для статической генерации локалей.

**Решение:**
- ✅ Добавлен `generateStaticParams()` в `app/[locale]/layout.tsx`
- ✅ Возвращает все локали: `['en', 'ru', 'es']`
- ✅ Страницы `app/[locale]/login/page.tsx` и `app/[locale]/register/page.tsx` существуют и проверены

**Код:**
```typescript
export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}
```

### 4. Создан middleware.ts

**Проблема:** Отсутствовал middleware для правильной обработки i18n роутинга и исключения API routes.

**Решение:**
- ✅ Создан `middleware.ts` в корне `web/`
- ✅ Исключает `/api/*` из обработки middleware
- ✅ Исключает статические файлы (`/_next/`, `/favicon.ico`, etc.)
- ✅ Правильно обрабатывает редиректы для локалей
- ✅ Не блокирует `/en/login` и `/en/register`
- ✅ Редиректит корневой путь `/` на `/en`

**Ключевые особенности:**
- API routes пропускаются: `if (pathname.startsWith('/api/')) return NextResponse.next()`
- Статические файлы пропускаются
- Локализованные пути не редиректятся повторно
- Корневой путь редиректит на `/en`

### 5. Проверка работы

**После исправлений:**
- ✅ `/en/login` - не 404, страница загружается
- ✅ `/en/register` - не 404, страница загружается
- ✅ `/api/v1/health` - возвращает JSON `{ ok: true }`
- ✅ `/api/v1/auth/login` - работает (POST запрос)
- ✅ `/api/v1/auth/register` - работает (POST запрос)
- ✅ Login/register формы отправляют запросы в API

## 📁 Измененные файлы

### Удалены:
1. **`web/app/api/v1/[...path]/route.ts`**
   - Удален legacy proxy route
   - Требовал `API_INTERNAL_BASE_URL`
   - Заменен прямыми route handlers

### Созданы:
1. **`web/middleware.ts`**
   - Обработка i18n роутинга
   - Исключение API routes
   - Редиректы для локалей

### Изменены:
1. **`web/app/[locale]/layout.tsx`**
   - Добавлен `generateStaticParams()` для статической генерации локалей

2. **`web/app/api/v1/health/route.ts`**
   - Упрощен: возвращает только `{ ok: true }`

## 🔍 Что было сломано и почему

### 1. API_INTERNAL_BASE_URL зависимость

**Проблема:**
- Legacy proxy route `app/api/v1/[...path]/route.ts` требовал `API_INTERNAL_BASE_URL`
- Без этой переменной возвращал 404 для всех API запросов
- Это создавало зависимость от внешнего API сервиса

**Почему сломано:**
- Проект был переделан на Next.js route handlers, но legacy proxy остался
- Proxy route перехватывал запросы до прямых handlers
- В продакшне на Vercel нет внешнего API, все должно работать через route handlers

**Исправление:**
- Удален legacy proxy route
- Все API endpoints теперь обрабатываются прямыми route handlers
- Нет зависимости от внешних переменных окружения

### 2. Отсутствие generateStaticParams

**Проблема:**
- Next.js App Router требует `generateStaticParams` для динамических сегментов
- Без него локали могут не генерироваться правильно
- Может приводить к 404 для некоторых локалей

**Почему сломано:**
- Функция не была добавлена при создании layout
- Next.js не знал какие локали нужно предгенерировать

**Исправление:**
- Добавлен `generateStaticParams()` который возвращает все локали
- Next.js теперь знает что нужно генерировать для `en`, `ru`, `es`

### 3. Отсутствие middleware.ts

**Проблема:**
- Не было middleware для обработки i18n роутинга
- Корневой путь `/` мог не редиректить правильно
- API routes могли обрабатываться неправильно
- Могли быть бесконечные редиректы

**Почему сломано:**
- Middleware не был создан изначально
- Next.js без middleware не знает как обрабатывать локали
- Может приводить к 404 или неправильным редиректам

**Исправление:**
- Создан `middleware.ts` с правильной логикой
- Исключает API routes из обработки
- Правильно обрабатывает локали
- Предотвращает бесконечные редиректы

### 4. Health endpoint возвращал лишние данные

**Проблема:**
- Health endpoint возвращал `{ ok: true, env: ..., timestamp: ... }`
- Требование было только `{ ok: true }`

**Исправление:**
- Упрощен до `{ ok: true }`

## ✅ Итоговый checklist

- [x] Убрана зависимость от `API_INTERNAL_BASE_URL`
- [x] Все запросы используют относительные пути `/api/v1/...`
- [x] Все API routes проверены и работают
- [x] Health endpoint возвращает `{ ok: true }`
- [x] Добавлен `generateStaticParams` в `app/[locale]/layout.tsx`
- [x] Страницы `/en/login` и `/en/register` существуют
- [x] Создан `middleware.ts` с правильной логикой
- [x] Middleware исключает `/api/*`
- [x] Middleware не блокирует `/en/login` и `/en/register`
- [x] Нет бесконечных редиректов
- [x] Login/register формы отправляют запросы в API

## 🚀 Готово к продакшну

Проект готов к деплою на Vercel. Все зависимости от внешних сервисов убраны, все запросы используют относительные пути, i18n роутинг настроен правильно.

