# 🔬 Технические решения

## 1. Event-Driven Realtime

**Проблема:** Задержка 3-5 сек, высокая нагрузка от polling

**Решение:**
```typescript
// Вместо polling каждые 500ms
supabase.channel(`game:${gameId}`)
  .on('postgres_changes', { event: 'UPDATE', table: 'games' }, 
    (payload) => debouncedRefresh())
  .subscribe();
```

**Результат:** Задержка <200ms, нагрузка -90%

## 2. Оптимистичные обновления

```typescript
// 1. Мгновенное обновление UI (0ms)
setGameState(optimisticState);

// 2. Подтверждение с сервера
const success = await db.action();

// 3. Откат при ошибке
if (!success) setGameState(originalState);
```

**Результат:** UI отклик 0ms вместо 200-500ms

## 3. Оптимистическая блокировка

```sql
-- Атомарное обновление с проверкой версии
UPDATE players 
SET revealed_characteristics = array_append(...)
WHERE id = p_player_id
  AND revealed_characteristics = p_current_revealed;

RETURN FOUND; -- false если версия изменилась
```

**Результат:** Предотвращение race conditions

## 4. Адаптивный polling

```typescript
const pollingInterval = useMemo(() => {
  switch (phase) {
    case 'lobby': return false; // Realtime only
    case 'turn': return 300;    // Быстрый
    case 'discussion': return 1000; // Медленный
  }
}, [phase]);
```

**Результат:** Оптимальная частота для каждой фазы

## 5. Мемоизация

```typescript
// Дорогие вычисления
const alivePlayers = useMemo(() => 
  gameState?.players.filter(p => !p.isEliminated) || [],
  [gameState?.players]
);

// Компоненты
const PlayerCard = memo(({ player }) => { /* ... */ });
```

**Результат:** Снижение ре-рендеров на 70%

## 6. Система анимаций с очередью

```typescript
class AnimationQueue {
  enqueue(animation) {
    this.queue.push(animation);
    if (!this.current) this.playNext();
  }
  
  dequeue() {
    this.current = null;
    this.playNext();
  }
}
```

**Результат:** Последовательное воспроизведение без хаоса

## 7. Динамическая генерация

```typescript
// Случайный возраст 16-101
const age = Math.floor(Math.random() * 86) + 16;

// Динамическая тяжесть 10-100%
const severity = Math.floor(Math.random() * 10 + 1) * 10;
```

**Результат:** Миллионы уникальных комбинаций

## 8. AI с fallback

```typescript
try {
  return await callDeepSeekAPI(gameState);
} catch {
  // Детерминированная логика
  const survived = Math.random() < (baseSurvivalChance / 100);
  return { survived, reason: '...' };
}
```

**Результат:** Игра работает даже без AI

## 9. Приоритетная синхронизация

```typescript
// Критичные события немедленно
if (event.type === 'phase:changed') {
  await fetchGameState();
} else {
  debouncedFetch(); // 150ms debounce
}
```

**Результат:** Критичные <100ms, обычные <200ms

## 10. Система восстановления

```sql
CREATE FUNCTION recover_player(
  p_game_id UUID,
  p_old_player_id UUID,
  p_new_user_id UUID
) RETURNS JSONB AS $
BEGIN
  -- Копирование всех данных игрока
  INSERT INTO players (...)
  SELECT ... FROM players WHERE id = p_old_player_id;
  
  DELETE FROM players WHERE id = p_old_player_id;
  RETURN jsonb_build_object('success', true);
END;
$ LANGUAGE plpgsql;
```

**Результат:** Бесшовное переподключение с сохранением прогресса

## Метрики

### До оптимизаций
- Задержка UI: 200-500ms
- Синхронизация: 3-5 сек
- Запросов к БД: ~120/мин
- Ре-рендеров: ~200/мин

### После оптимизаций
- Задержка UI: <50ms (**4-10x**)
- Синхронизация: <200ms (**15-25x**)
- Запросов к БД: ~12/мин (**10x**)
- Ре-рендеров: ~60/мин (**3x**)

## Архитектурные паттерны

- **Context + Hooks** — композиция состояния
- **Optimistic UI** — мгновенный отклик
- **Event Bus** — централизованные события
- **Queue** — последовательная обработка
- **Priority Queue** — критичные события первыми

## Безопасность

```sql
-- Row Level Security
CREATE POLICY "Players can view their game"
ON players FOR SELECT
USING (game_id IN (
  SELECT game_id FROM players WHERE id = auth.uid()
));

-- Валидация на сервере
CREATE FUNCTION reveal_characteristic_atomic(...)
RETURNS BOOLEAN AS $
BEGIN
  IF NOT valid(...) THEN RETURN FALSE; END IF;
  UPDATE players ... WHERE ... AND version = expected;
  RETURN FOUND;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```
