# 👨‍💻 Для разработчиков

## Что можно изучить

**Frontend:**
- React 18 + TypeScript
- Realtime синхронизация через WebSocket
- Оптимистичные обновления UI
- Сложная анимационная система
- State management (Context + Hooks)
- React Query для кеширования

**Backend:**
- Supabase (PostgreSQL + Realtime + Auth)
- Row Level Security
- RPC функции для бизнес-логики
- Database triggers
- Оптимистическая блокировка

**Архитектура:**
- Event-driven подход
- Приоритетная очередь событий
- Батчинг обновлений
- Мемоизация и оптимизация

## Интересные решения

### 1. Realtime без polling
```typescript
supabase.channel(`game:${gameId}`)
  .on('postgres_changes', { event: 'UPDATE', table: 'games' }, handleUpdate)
  .subscribe();
```
Результат: Задержка <200ms вместо 3-5 сек

### 2. Оптимистичные обновления
```typescript
setGameState(optimisticState);
const success = await db.action();
if (!success) setGameState(originalState);
```
Результат: UI отклик <50ms

### 3. Оптимистическая блокировка
```sql
UPDATE players SET ... 
WHERE id = p_player_id AND version = expected_version;
RETURN FOUND;
```
Результат: Предотвращение race conditions

### 4. Динамическая генерация
```typescript
const age = Math.floor(Math.random() * 86) + 16;
const severity = Math.floor(Math.random() * 10 + 1) * 10;
```
Результат: Миллионы уникальных комбинаций

### 5. AI с fallback
```typescript
try {
  return await callAI(gameState);
} catch {
  return calculateLocally(gameState);
}
```
Результат: Игра работает без AI

## Архитектура

```
React UI → GameContext → React Query → Supabase Realtime → PostgreSQL
```

## Ключевые компоненты

**GameContext** — центральный контекст управления состоянием  
**useGameQuery** — React Query хук с адаптивным polling  
**useActionCards** — управление картами действий  
**useGameJudge** — AI интеграция

## Структура проекта

```
src/
├── components/game/    # Игровые компоненты
├── contexts/           # GameContext
├── hooks/              # useGame, useGameQuery, useActionCards
├── pages/              # GamePage, GamePageDesktop
├── types/              # TypeScript типы
└── data/               # Игровой контент
```

## Метрики

**Производительность:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- UI Response: <50ms
- Sync Delay: <200ms

**Масштаб:**
- ~15,000 строк кода
- 30+ компонентов React
- 25+ хуков
- 20+ миграций БД

**Контент:**
- 50+ катастроф
- 63 профессии
- 90+ состояний здоровья
- 30 карт действий

## Технологический стек

**Core:** React 18.3, TypeScript 5.8, Vite 5.4, Tailwind CSS 3.4  
**State:** React Context, React Query 5.83  
**UI:** Radix UI, Framer Motion 12, Lucide React  
**Backend:** Supabase 2.90, PostgreSQL, Realtime

## Что можно узнать

**Архитектурные паттерны:**
- Event-driven architecture
- Optimistic UI updates
- Priority queue pattern
- Context + Hooks composition

**Realtime технологии:**
- WebSocket синхронизация
- Батчинг событий
- Обработка race conditions

**Производительность:**
- Мемоизация компонентов
- Кеширование вычислений
- Адаптивный polling

**Безопасность:**
- Row Level Security
- Серверная валидация
- Оптимистическая блокировка

## Применение

Технологии из этого проекта можно применить в:
- Realtime приложениях (чаты, коллаборация)
- Многопользовательских играх
- Социальных платформах
- Collaborative tools
- Live dashboards

## Лицензия

**Proprietary** — исходный код не публикуется. Этот README создан для демонстрации технических решений.
