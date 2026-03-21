export interface Player {
  id: string; // Уникальный ID игрока
  name: string; // Имя игрока
  isHost: boolean; // Является ли хостом
  isEliminated: boolean; // Изгнан ли из бункера
  characteristics: Characteristics; // Характеристики персонажа
  revealedCharacteristics: (keyof Characteristics)[]; // Раскрытые характеристики
  votesAgainst: number; // Количество голосов против
  hasVoted: boolean; // Проголосовал ли в текущем раунде
  usedActionCards: string[]; // ID использованных карт действий
  extraBaggage: string | null; // Дополнительный багаж (карта 12)
  extraProfession: string | null; // Дополнительная профессия (карта 13)
  stolenBaggageFrom: string | null; // ID игрока, у которого украли багаж
}

export interface Characteristics {
  profession: string; // Профессия
  biology: string; // Биология (пол, возраст, ориентация)
  health: string; // Состояние здоровья
  phobia: string; // Фобия
  hobby: string; // Хобби
  baggage: string; // Багаж
  fact: string; // Факт 1
  fact2: string; // Факт 2
  actionCard1: string; // Карта действий 1
  actionCard2: string; // Карта действий 2
}

export interface Bunker {
  name: string; // Название бункера
  location: string; // Местоположение и глубина
  size: string; // Размер в кв.м
  stayDuration: string; // Время пребывания
  foodSupply: string; // Запас еды
  items: string[]; // Предметы в бункере (5 случайных из 70)
}

export interface Catastrophe {
  name: string; // Название катастрофы
  description: string; // Детальное описание
  survivalCondition: string; // Условие выживания
}

export interface GameState {
  id: string; // ID игры
  phase: GamePhase; // Текущая фаза игры
  currentRound: number; // Текущий раунд
  maxRounds: number; // Максимальное количество раундов
  currentPlayerIndex: number; // Индекс текущего игрока
  players: Player[]; // Список игроков
  bunker: BunkerDB; // Данные бункера
  catastrophe: CatastropheDB; // Данные катастрофы
  bunkerSlots: number; // Количество мест в бункере
  timeRemaining: number; // Оставшееся время
  votingPhase: VotingPhase; // Фаза голосования
  votes: Record<string, string>; // Голоса (voterId -> targetId)
  tiedPlayers: string[]; // ID игроков в ничьей (для переголосования)
  isRevote: boolean; // Является ли переголосованием
  
  // Состояние карт действий
  pendingAction: PendingAction | null; // Ожидающее действие карты
  roundRestrictions: ('biology' | 'hobby' | 'baggage')[]; // Ограничения раскрытия (карты 7,8,9)
  doubleVotePlayerId: string | null; // Игрок с двойным голосом (карты 1,15)
  cannotVotePlayerId: string | null; // Игрок, который не может голосовать (карта 16)
  immunityPlayerId: string | null; // Игрок с иммунитетом от изгнания (карта 3)
  linkedPlayerId: string | null; // Связанный игрок (карта 19)
  linkedByPlayerId: string | null; // Кто активировал связь
  penaltyNextRoundPlayerId: string | null; // Игрок с +1 голосом в следующем раунде (карта 1)
  ratRaidActive: boolean; // Активен ли рейд крыс (карта 30, -15% к выживанию)
  aiJudgement: { survived: boolean; reason: string } | null; // Вердикт AI-судьи
}

export type GamePhase = 
  | 'lobby'        // Лобби (ожидание игроков)
  | 'introduction' // Введение (знакомство с катастрофой)
  | 'turn'         // Ход игрока (раскрытие характеристик)
  | 'discussion'   // Дискуссия
  | 'defense'      // Защита игрока
  | 'voting'       // Голосование
  | 'results'      // Результаты голосования
  | 'farewell'     // Прощание с изгнанным
  | 'gameover';    // Конец игры

export type VotingPhase = 
  | 'none'       // Нет голосования
  | 'statements' // Заявления игроков
  | 'voting'     // Процесс голосования
  | 'defense'    // Защита
  | 'revote';    // Переголосование

export type ActionCardEffect = 
  | 'double_vote_with_penalty'        // Карта 1: Двойной голос с риском
  | 'new_profession'                  // Карта 2: Смена профессии
  | 'give_immunity'                   // Карта 3: Иммунитет
  | 'new_health'                      // Карта 4: Новое здоровье
  | 'new_phobia'                      // Карта 5: Новая фобия
  | 'restrict_biology'                // Карта 7: Запрет биологии
  | 'restrict_hobby'                  // Карта 8: Запрет хобби
  | 'restrict_baggage'                // Карта 9: Запрет багажа
  | 'shuffle_professions'             // Карта 10: Перемешать профессии
  | 'shuffle_baggage'                 // Карта 11: Перемешать багаж
  | 'extra_baggage'                   // Карта 12: Дополнительный багаж
  | 'extra_profession'                // Карта 13: Дополнительная профессия
  | 'give_double_vote'                // Карта 15: Усиление голоса
  | 'block_vote'                      // Карта 16: Блокировка голоса
  | 'steal_baggage'                   // Карта 17: Кража багажа
  | 'revive_player'                   // Карта 18: Воскрешение
  | 'link_elimination'                // Карта 19: Связанные судьбы
  | 'swap_biology'                    // Карта 20: Обмен биологией
  | 'cancel'                          // Карты 21,22: Отмена
  | 'random_baggage'                  // Карта 24: Случайный багаж
  | 'force_revote'                    // Карта 25: Переголосование
  | 'remove_phobia'                   // Карта 26: Удаление фобии
  | 'random_biology'                  // Карта 27: Случайная биология
  | 'age_swap'                        // Карта 28: Время жизни
  | 'reveal_random_characteristic'    // Карта 29: Внутренний мир
  | 'rat_raid';                       // Карта 30: Время крыс!

export interface ActionCard {
  id: string; // ID карты
  name: string; // Название
  description: string; // Описание эффекта
  effect: ActionCardEffect; // Тип эффекта
  requiresTarget: boolean; // Требуется ли выбор цели
  targetType: ActionCardTargetType; // Тип цели
  isCancelCard?: boolean; // Карта отмены (21, 22)
  onlyAfterResults?: boolean; // Только после результатов (карта 25)
  onlyAfterElimination?: boolean; // Только после изгнания (карта 30)
}

export interface PendingAction {
  cardId: string; // ID карты (actionCard1 или actionCard2)
  cardName: string; // Название карты
  cardDescription: string; // Описание
  playerId: string; // Кто активировал
  playerName: string; // Имя активатора
  effect: ActionCardEffect; // Эффект
  requiresTarget: boolean; // Требуется ли цель
  targetType: ActionCardTargetType; // Тип цели
  targetId: string | null; // Выбранная цель
  targetName: string | null; // Имя цели
  expiresAt: Date; // Когда истекает окно отмены (4 секунды)
  isCancelled: boolean; // Отменено ли
  cancelledByPlayerId: string | null; // Кто отменил
  cancelledByPlayerName?: string | null; // Имя отменившего
}

export const CHARACTERISTIC_NAMES: Record<keyof Characteristics, string> = {
  profession: 'Профессия',
  biology: 'Биология',
  health: 'Здоровье',
  phobia: 'Фобия',
  hobby: 'Хобби',
  baggage: 'Багаж',
  fact: 'Факт',
  fact2: 'Факт 2',
  actionCard1: 'Карта действий 1',
  actionCard2: 'Карта действий 2',
};
