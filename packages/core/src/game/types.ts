/**
 * Commands in, events out (docs/tech/02-architecture.md, "The core's surface").
 * The shell, the UI and the simulator all drive the game through `dispatch`
 * and learn what happened through `on`.
 */
import type { Num } from '../kernel/num/num';
import type { VisitorKind } from './state';

export type Command =
  // Floors
  | { type: 'harvest'; world: number; floor: number }
  | { type: 'buyLevels'; world: number; floor: number; count: number }
  | { type: 'openFloor'; world: number }
  | { type: 'hire'; world: number; floor: number }
  | { type: 'plant'; world: number; floor: number; plants: string[] }
  | { type: 'buyTicket'; world: number }
  | { type: 'focus'; world: number }
  // Tapping and visitors
  | { type: 'tap'; count: number }
  | { type: 'startSpurt' }
  | { type: 'catchVisitor'; index: number }
  | { type: 'useAbility'; id: string; world?: number }
  // Twists
  | { type: 'serveCustomers'; count: number }
  | { type: 'popBubbles' }
  | { type: 'catchSunrise' }
  // Collection
  | { type: 'openChest'; chest: string }
  | { type: 'buyChest'; chest: string }
  | { type: 'collectBasket' }
  | { type: 'levelCard'; id: string }
  | { type: 'buyCopy'; id: string }
  | { type: 'equip'; heirlooms: string[] }
  | { type: 'levelHeirloom'; id: string }
  | { type: 'buyHeirloomCopy'; id: string }
  | { type: 'pickHeirloom'; id: string }
  // Player
  | { type: 'skill'; id: string }
  | { type: 'respec' }
  | { type: 'research'; id: string }
  | { type: 'bench'; plantId: string }
  // Resets and shops
  | { type: 'replant'; world: number }
  | { type: 'festival' }
  | { type: 'buyCompostShop'; id: string }
  | { type: 'buyRibbonShop'; id: string }
  /** Auto-Gardener switches: one floor, every floor of one world, or (no world) every floor. */
  | { type: 'setAutoBuy'; on: boolean; world?: number; floor?: number }
  | { type: 'setAutoReplant'; world: number; multiple: number }
  | { type: 'timeWarp'; size: 'small' | 'large' }
  // Weekend fair
  | { type: 'fairBuy'; floor: number; count: number }
  | { type: 'fairTap'; count: number };

export type GameEvent = { t: number } & (
  | { type: 'unlock'; id: string }
  | { type: 'floorOpened'; world: number; floor: number; first: boolean }
  | { type: 'milestone'; world: number; floor: number; tier: number; record: boolean }
  | { type: 'towerMilestone'; world: number; count: number }
  | { type: 'hire'; world: number; floor: number }
  | { type: 'replant'; world: number; gained: Num; compostEra: Num; runSeconds: number }
  | { type: 'festival'; gained: Num; ribbons: Num; n: number }
  | { type: 'worldReached'; world: number; first: boolean }
  | { type: 'levelUp'; level: number }
  | { type: 'chestOpened'; chest: string; cards: string[]; heirloom: string | null }
  | { type: 'cardNew'; id: string }
  | { type: 'cardLevel'; id: string; level: number }
  | { type: 'heirloomNew'; id: string }
  | { type: 'story'; id: string; n: number }
  | { type: 'quest'; kind: 'daily' | 'weekly' | 'chapter'; id: string }
  | { type: 'achievement'; id: string; tier: number }
  | { type: 'star'; world: number; stars: number }
  | { type: 'crowned'; world: number }
  | { type: 'researchDone'; id: string }
  | { type: 'benchDone'; id: string }
  | { type: 'visitor'; kind: VisitorKind }
  | { type: 'spurt'; world: number }
  | { type: 'offline'; seconds: number; paidSeconds: number; earned: Num[] }
  | { type: 'fairStep'; step: number }
  | { type: 'sunrise'; world: number; caught: boolean }
);

export type GameEventOf<T extends GameEvent['type']> = Extract<GameEvent, { type: T }>;

/** Distributes Omit over the union, so an event can be built without its time stamp. */
export type EventBody = GameEvent extends infer E ? (E extends GameEvent ? Omit<E, 't'> : never) : never;

/** Where a payment came from. The simulator uses it to say what each system is worth. */
export type IncomeSource = 'floors' | 'taps' | 'visitors' | 'twist' | 'abilities' | 'offline' | 'autopilot' | 'start';
