# 🏗️ Архитектура

## Стек

**Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
**Backend:** Supabase (PostgreSQL + Realtime + Auth)  
**Анимации:** Framer Motion  
**State:** React Context + React Query

## Слои

```
React UI → GameContext → React Query → Supabase Realtime → PostgreSQL
```

### 1. Presentation Layer
- Компоненты: `GamePage`, `PlayerCard`, `CharacterPanel`, `VotingPanel`
- Анимации для каждой характеристики
- Адаптивный дизайн (мобильные/десктоп)

### 2. Business Logic
- `useGame()` — основной хук
- `useGameQuery()` — загрузка и кеширование
- `useActionCards()` — логика карт действий
- `useGameJudge()` — AI интеграция

### 3. State Management
```typescript
interface GameContextType {
  gameState: GameState | null;
  currentPlayer: Player | null;
  createGame, joinGame, revealCharacteristic, castVote, nextPhase
}
```

### 4. Data Layer
- Supabase Client (REST + Realtime + Auth)
- Row Level Security
- RPC функции для бизнес-логики

## Синхронизация

**Event-driven через Supabase Realtime:**
- Нет постоянного polling
- Батчинг обновлений (100ms)
- Оптимистичные обновления для мгновенного UI
- Приоритетная очередь для критичных событий

## Безопасность

**Row Level Security:**
```sql
CREATE POLICY "Players can view their game"
ON players FOR SELECT
USING (game_id IN (
  SELECT game_id FROM players WHERE id = auth.uid()
));
```

**Валидация на сервере:**
- Все критичные операции через RPC функции
- Оптимистическая блокировка для race conditions
- Проверка прав для всех действий

## База данных

```sql
-- Основные таблицы
games (id, phase, current_round, bunker, catastrophe, ...)
players (id, game_id, name, characteristics, revealed_characteristics, ...)
action_logs (id, game_id, player_id, card_name, effect, ...)
```

**Индексы:**
- `idx_players_game_id` — быстрый поиск игроков
- `idx_action_logs_game_id` — быстрый поиск логов

## Оптимизации

**Производительность:**
- Мемоизация компонентов и вычислений
- Виртуализация списков
- Lazy loading компонентов
- Debounce для частых обновлений

**Сеть:**
- Снижение задержки с 3-5 сек до <200ms
- Уменьшение нагрузки на 90%
- Мгновенная синхронизация через Realtime

**UI:**
- Оптимистичные обновления (0ms отклик)
- GPU ускорение анимаций
- Адаптивный polling в зависимости от фазы

## AI Integration

```typescript
const judgeGame = async (gameState: GameState) => {
  // Расчет базового шанса выживания
  let baseSurvivalChance = 100;
  if (!canReproduce) baseSurvivalChance = 50;
  if (hasContagiousDisease) baseSurvivalChance = 30;
  
  // AI анализ через DeepSeek
  const aiResult = await callDeepSeekAPI(gameState, baseSurvivalChance);
  
  // Fallback при ошибке
  if (!aiResult) {
    return calculateLocally(baseSurvivalChance);
  }
  
  return aiResult;
};
```

## Масштабируемость

- Supabase автоматически масштабируется
- Vercel Edge для глобального распределения
- CDN для статических ресурсов
- Connection Pooling через PgBouncer
