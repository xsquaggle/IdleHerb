/**
 * Content table schemas (docs/tech/04-content-pipeline.md).
 *
 * These are the shapes of the YAML rows in packages/content/tables. The
 * TypeScript types and the validation rules are the same thing (zod).
 *
 * First version: every table's schema is in this one file so the economy core
 * could be written before the kernel's SystemModule contract exists. When the
 * systems get their own `schema.ts`, each block below moves to its system
 * folder unchanged.
 */
import { z } from 'zod';

/**
 * A rarity tier's id, from tables/tiers.yaml (design 0.5: eleven tiers). Tiers are data: the
 * loader checks every id against the table, and no code compares tier names (tiers.test.ts).
 */
export type TierId = string;
/** The old name for a tier id. */
export type Rarity = TierId;
export const FAMILIES = ['hemp', 'mint', 'basil', 'rosemary', 'lavender', 'sage', 'chamomile', 'thyme'] as const;
export type Family = (typeof FAMILIES)[number];

/** Every stat an effect may name (CONTENT.md 0.2, plus the few slot counts the tables need). */
export const STATS = [
  'floor.profit', 'floor.speed', 'floor.levelCost', 'floor.doubleChance', 'tower.milestoneMult',
  'tap.power', 'tap.critChance', 'tap.critMult', 'tap.comboCap', 'tap.comboGrace',
  'spurt.duration', 'spurt.tapsNeeded', 'spurt.speed', 'spurt.bumperFill',
  'visitor.interval', 'visitor.lifetime', 'visitor.reward', 'visitor.windfall',
  'offline.earnings', 'offline.efficiency', 'offline.cap',
  'chest.luck', 'insight.gain', 'pollen.gain', 'pollen.maxedBonus', 'compost.gain',
  'manager.power', 'manager.cooldown', 'plant.power', 'plant.affinity', 'heirloom.power',
  'hire.fee', 'bench.speed', 'bench.slots', 'dew.duration',
  'heirloom.slots', 'planter.count', 'basket.store', 'research.desks',
] as const;
export type StatId = (typeof STATS)[number];

const big = z.union([z.string(), z.number()]);
const rarity = z.string().regex(/^[a-z]+$/);
const family = z.enum(FAMILIES);
const stat = z.enum(STATS);

/**
 * One contribution to a stat (CONTENT.md 0.1).
 *  inc    a percentage; all inc effects on one stat in one bucket add, buckets multiply
 *  add    a flat amount added to the stat
 *  mul    multiplies the stat
 *  reduce a reduction; each source is its own (1 - value) factor
 */
export const EffectSchema = z
  .object({
    stat,
    op: z.enum(['inc', 'add', 'mul', 'reduce']),
    value: z.number(),
    scope: z.enum(['floor', 'adjacent', 'world', 'global']).optional(),
    family: family.optional(),
    fixed: z.boolean().optional(),
  })
  .strict();
export type Effect = z.infer<typeof EffectSchema>;

export const AbilitySchema = z
  .object({
    id: z.string().regex(/^ability\.[a-z_]+$/),
    cooldownSec: z.number().positive(),
    kind: z.enum([
      'buff', 'lumpSum', 'comboLock', 'callVisitor', 'guaranteedCrits', 'fillSpurt', 'startSpurt',
      'chestLuckNext', 'fillHeat', 'fillBubbles', 'catchSunrise', 'tapBoost', 'jackpot', 'timeSkip', 'resetCooldowns',
    ]),
    stat: z.enum(['floor.profit', 'floor.speed', 'floor.levelCost']).optional(),
    scope: z.enum(['floor', 'world']).optional(),
    mult: z.number().optional(),
    durationSec: z.number().optional(),
    seconds: z.number().optional(),
    taps: z.number().optional(),
    count: z.number().optional(),
    fraction: z.number().optional(),
  })
  .strict();
export type Ability = z.infer<typeof AbilitySchema>;

/** A condition used by unlocks and story goals. */
export const ConditionSchema = z
  .object({
    kind: z.enum([
      'start', 'counter', 'floorLevel', 'anyFloorLevel', 'floorOpened', 'lifetime', 'playerLevel', 'playSeconds',
      'firstReturn', 'replantAvailable', 'festivalAvailable', 'worldReached', 'research', 'shopLevel',
      'masteryStars', 'allFloorsLevel', 'holdCoins', 'ribbonsPending', 'managerHired',
    ]),
    counter: z.string().optional(),
    world: z.number().int().optional(),
    floor: z.number().int().optional(),
    level: z.number().int().optional(),
    gte: big.optional(),
    id: z.string().optional(),
  })
  .strict();
export type Condition = z.infer<typeof ConditionSchema>;

export const RewardSchema = z
  .object({
    gems: z.number().optional(),
    pollen: z.number().optional(),
    chest: z.string().optional(),
    special: z.string().optional(),
    heirloom: z.string().optional(),
    epicCopies: z.number().optional(),
  })
  .strict();
export type Reward = z.infer<typeof RewardSchema>;

/** One number per tier, keyed by tier id. The loader checks the keys against tables/tiers.yaml. */
const rarityNumbers = z.record(rarity, z.number());
const chestOdds = z.record(rarity, z.number());
const heirloomOdds = z.record(rarity, z.number());

export const TuningSchema = z
  .object({
    MILESTONES_FIRST: z.array(z.number().int().positive()),
    MILESTONES_STEP: z.number().int().positive(),
    MILESTONE_MULT: z.number().gt(1),
    TOWER_MILESTONE_MULT: z.number().gte(1),
    TOWER_MILESTONE_CAP: z.number().gte(1),
    MIN_CYCLE: z.number().positive(),
    COST_MULT_FLOOR: z.number().positive(),
    FLOOR_DISCOUNT_CAP: z.number(),
    CONSTRUCTION_TIME: z.number().nonnegative(),
    HOLD_RATE: z.number().positive(),
    TAP_RATE_CAP: z.number().positive(),
    TAP_SECONDS: z.number().positive(),
    TAP_POWER_CAP: z.number().positive(),
    COMBO_PER_STACK: z.number(),
    COMBO_CAP_BASE: z.number(),
    COMBO_CAP_MAX: z.number(),
    COMBO_GRACE: z.number(),
    COMBO_GRACE_CAP: z.number(),
    COMBO_DECAY: z.number(),
    COMBO_TAPS_PER_STACK: z.number().positive(),
    CRIT_CHANCE_BASE: z.number(),
    CRIT_MULT_BASE: z.number(),
    CRIT_CHANCE_CAP: z.number(),
    CRIT_MULT_CAP: z.number(),
    SPURT_TAPS: z.number().positive(),
    SPURT_TAPS_MIN: z.number().positive(),
    SPURT_DURATION: z.number().positive(),
    SPURT_DURATION_CAP: z.number().positive(),
    SPURT_SPEED: z.number().positive(),
    SPURT_SPEED_CAP: z.number().positive(),
    VISITOR_MIN: z.number().positive(),
    VISITOR_MAX: z.number().positive(),
    VISITOR_LIFETIME: z.number().positive(),
    VISITOR_INTERVAL_MIN_MULT: z.number().positive(),
    WINDFALL_SECONDS: z.number(),
    SUNBEAM_MULT: z.number(),
    SUNBEAM_DURATION: z.number(),
    TAP_STORM_MULT: z.number(),
    TAP_STORM_DURATION: z.number(),
    DEWDROP_GEMS: z.number(),
    VISITOR_WEIGHTS: z.object({ windfall: z.number(), sunbeam: z.number(), storm: z.number(), dewdrop: z.number(), crate: z.number() }).strict(),
    BEE_MIN: z.number(),
    BEE_MAX: z.number(),
    BEE_POLLEN: z.number(),
    BOOST_STACKING: z.enum(['add', 'multiply', 'strongest']),
    BOOST_CAP: z.number().nonnegative(),
    LUMP_SUM_USES_BOOSTS: z.boolean(),
    MGR_BASE: rarityNumbers,
    MGR_STEP: rarityNumbers,
    PERK_PER_LEVEL: z.number(),
    CHEST_MANAGER_SHARE: z.number().min(0).max(1),
    NEW_CARD_CHESTS: z.number().int(),
    PITY_EPIC: z.number().int().positive(),
    PITY_LEGENDARY: z.number().int().positive(),
    BASKET_HOURS: z.number().positive(),
    BASKET_STORE: z.number().int().positive(),
    POLLEN_FROM_MAXED: rarityNumbers,
    POLLEN_COPY_COST: chestOdds,
    GEM_CHEST_COST: z.object({ copper: z.number(), silver: z.number(), golden: z.number(), crystal: z.number() }).strict(),
    REPLANT_CHEST_FRACTION: z.number(),
    REPLANT_CHEST_COOLDOWN_HOURS: z.number(),
    MILESTONE_CRATE_TIERS: z.array(z.number().int()),
    AFFINITY_BONUS: z.number(),
    DUAL_TRAIT_FACTOR: z.number(),
    TRAIT_PER_LEVEL: z.number(),
    RARITY_FACTOR: rarityNumbers,
    THRIFTY_FLOOR_CAP: z.number(),
    HYBRID_POLLEN: z.number(),
    HYBRID_HOURS: z.number(),
    HYBRID_PARENT_LEVEL: z.number().int(),
    EXOTIC_POLLEN: z.number(),
    EXOTIC_HOURS: z.number(),
    EXOTIC_PARENT_LEVEL: z.number().int(),
    HEIRLOOM_SLOTS_BASE: z.number().int(),
    HEIRLOOM_PER_LEVEL: z.number(),
    HEIRLOOM_ODDS: heirloomOdds,
    HEIRLOOM_ODDS_STARLIGHT: heirloomOdds,
    HEIRLOOM_POLLEN_FROM_MAXED: heirloomOdds,
    PITY_HEIRLOOM: z.number().int().nonnegative(),
    HEIRLOOM_NO_REPEATS: z.boolean(),
    POLLEN_HEIRLOOM_COPY_COST: heirloomOdds,
    XP_BASE: z.number(),
    XP_PER_LEVEL: z.number(),
    LEVEL_CAP: z.number().int(),
    LEVEL_UP_GEMS: z.number(),
    RESPEC_GEMS: z.number(),
    XP_DAILY: z.number(),
    XP_DAILY_ALL: z.number(),
    XP_WEEKLY: z.number(),
    XP_WEEKLY_ALL: z.number(),
    XP_MILESTONE_PER_TIER: z.number(),
    REPLANT_XP_STEP: z.number(),
    XP_CHEST_PER_TIER: z.number(),
    XP_VISITOR: z.number(),
    XP_ACHIEVEMENT: z.array(z.number()).length(5),
    XP_MASTERY_STAR: z.number(),
    XP_CHAPTER: z.number(),
    INSIGHT_PER_MILESTONE: z.number(),
    INSIGHT_TANK_HOURS: z.number(),
    RESEARCH_QUEUE: z.number().int().positive(),
    DAILY_COUNT: z.number().int(),
    DAILY_GEMS: z.number(),
    DAILY_GEMS_ALL: z.number(),
    DAILY_POLLEN: z.number(),
    DAILY_POLLEN_ALL: z.number(),
    WEEKLY_COUNT: z.number().int(),
    WEEKLY_GEMS: z.number(),
    WEEKLY_GEMS_ALL: z.number(),
    ACHIEVEMENT_PCT: z.number(),
    ACHIEVEMENT_GEMS: z.array(z.number()).length(5),
    CODEX_PCT: z.number(),
    CODEX_GEMS: z.number(),
    COMPOST_E0: big,
    COMPOST_EXP: z.number().positive(),
    COMPOST_PCT: z.number(),
    FIRST_REPLANT_MIN: z.number(),
    RIBBON_C0: big,
    RIBBON_EXP: z.number().positive(),
    RIBBON_PCT: z.number(),
    FIRST_FESTIVAL_MIN: z.number(),
    FESTIVAL_NEEDS_WORLD: z.number().int(),
    MASTER_COMPOSTER_PCT: z.number(),
    BLUE_POLISH_PCT: z.number(),
    AUTO_BUY_SHARE: z.number(),
    /** Design 0.4: the Auto-Gardener keeps floor 1's manager hired and opens floors, so no world goes dead. */
    AUTO_GARDENER_RESTARTS: z.boolean(),
    MASTERY_LEVELS: z.array(z.number().int().positive()),
    /** Design 0.5: each tier is TIER_STEP times as strong as the one below (EXPANSION 2.2). */
    TIER_STEP: z.number().gt(1),
    /** The best tier a chest's card slot can roll (EXPANSION 1.3 rule 1). Higher tiers are earned. */
    CHEST_CARD_TOP: rarity,
    /** PITY_EPIC counts cards since the last one of this tier or better. PITY_LEGENDARY counts toward CHEST_CARD_TOP. */
    PITY_EPIC_TIER: rarity,
    /** The tier of a world's Head, the manager of its top floor (GDD 7.1 rule 8). */
    HEAD_TIER: rarity,
    /** The tier of heirloom the Heirloom Pick chooses from (GDD 8.3). */
    HEIRLOOM_PICK_TIER: rarity,
    /** The tier of manager a reward's `epicCopies` gives copies of (GDD 15.3). */
    EPIC_COPIES_TIER: rarity,
    MASTERY_PCT: z.number(),
    MASTERY_EXOTIC_STARS: z.array(z.number().int()),
    CUSTOMER_INTERVAL: z.number().positive(),
    CUSTOMER_QUEUE_CAP: z.number().int(),
    CUSTOMER_TIP_SECONDS: z.number(),
    CUSTOMER_SERVE_RATE: z.number(),
    WEATHER_LOOP: z.object({ sunshine: z.number(), rain: z.number(), breeze: z.number(), rainbow: z.number() }).strict(),
    WEATHER_FAMILIES: z.object({ sunshine: z.array(family), rain: z.array(family), breeze: z.array(family) }).strict(),
    WEATHER_PROFIT: z.number(),
    HEAT_PER_TAP: z.number(),
    HEAT_DECAY: z.number(),
    HEAT_FLOOR: z.number(),
    HEAT_MAX: z.number(),
    HEAT_PROFIT: z.number(),
    BUBBLE_CAP_SECONDS: z.number(),
    BUBBLE_BONUS: z.number(),
    BUBBLE_CHAIN_WINDOW: z.number(),
    BUBBLE_CHAIN_STEP: z.number(),
    BUBBLE_CHAIN_MAX: z.number(),
    ORBIT_SECONDS: z.number(),
    SUNRISE_WINDOW: z.number(),
    SUNRISE_BONUS: z.number(),
    SUNRISE_STREAK_STEP: z.number(),
    SUNRISE_BONUS_MAX: z.number(),
    OFFLINE_CAP_BASE: z.number(),
    OFFLINE_CAP_MAX: z.number(),
    OFFLINE_EFF_BASE: z.number(),
    OFFLINE_EFF_CAP: z.number(),
    DEW_AWAY_HOURS: z.number(),
    DEW_DURATION: z.number(),
    DEW_MULT: z.number(),
    COMPOUND_INTEREST_PER_HOUR: z.number(),
    COMPOUND_INTEREST_MAX: z.number(),
    TIME_WARP: z.object({ small: z.object({ gems: z.number(), hours: z.number() }), large: z.object({ gems: z.number(), hours: z.number() }) }),
    COOLDOWN_REDUCTION_CAP: z.number(),
    HIRE_FEE_MULT_MIN: z.number(),
    EVENT_UNLOCK_LEVEL: z.number().int(),
    FAIR_FLOORS: z.number().int(),
    FAIR_OFFLINE_EFF: z.number(),
    FAIR_OFFLINE_CAP: z.number(),
    TICKET_WAYPOINTS: z.array(z.number().positive()),
    WAYPOINT_GEMS: z.number(),
  })
  .strict();
export type Tuning = z.infer<typeof TuningSchema>;

export const WorldRowSchema = z
  .object({
    id: z.string().regex(/^world\.w\d$/),
    order: z.number().int().positive(),
    climate: z.string(),
    currency: z.string(),
    floors: z.number().int().positive(),
    D: big,
    T: z.number().positive(),
    compostK: z.number().positive(),
    ticket: big.nullable(),
    deedRibbons: z.number().nonnegative(),
    twist: z.enum(['none', 'customers', 'weather', 'heat', 'bubbles', 'sunrise']),
    launch: z.boolean(),
    /** This world's own ten Mastery levels (design 0.4 proposal). Absent: tuning MASTERY_LEVELS. */
    mastery: z.array(z.number().int().positive()).length(10).optional(),
  })
  .strict()
  .refine((w) => !w.mastery || w.mastery.every((lv, i) => i === 0 || lv > w.mastery![i - 1]!), { message: 'mastery levels must rise strictly' });
export type WorldRow = z.infer<typeof WorldRowSchema>;

export const FloorRowSchema = z
  .object({
    id: z.string().regex(/^floor\.w\d\.[a-z_]+$/),
    world: z.string(),
    order: z.number().int().positive(),
    favouredFamily: z.union([family, z.literal('wild')]),
    openCost: big,
    basePayout: big,
    baseCycleSec: z.number().positive(),
    levelCost: z.object({ base: big, growth: z.number().gt(1) }).strict(),
    hireFee: big,
  })
  .strict();
export type FloorRow = z.infer<typeof FloorRowSchema>;

export const ManagerRowSchema = z
  .object({
    id: z.string().regex(/^card\.manager\.[a-z_]+$/),
    n: z.number().int(),
    /** The floor this manager runs. Every floor has exactly one manager (GDD 7.1). */
    floor: z.string().regex(/^floor\.w\d\.[a-z_]+$/),
    rarity,
    launch: z.boolean(),
    perk: EffectSchema,
    ability: AbilitySchema.optional(),
  })
  .strict();
export type ManagerRow = z.infer<typeof ManagerRowSchema>;

export const TraitRowSchema = z
  .object({ id: z.string().regex(/^trait\.[a-z]+$/), stat, op: z.enum(['inc', 'add', 'reduce']), base: z.number(), scope: z.enum(['floor', 'adjacent', 'world', 'global']) })
  .strict();
export type TraitRow = z.infer<typeof TraitRowSchema>;

export const PlantRowSchema = z
  .object({
    id: z.string().regex(/^plant\.[a-z]+\.[a-z]+$/),
    family,
    rarity,
    traits: z.array(z.string()).min(1).max(2),
    /** chest: rolled from chests; hybrid: cross-pollination; mutation: the Mutation Pot (GDD 8.6). */
    source: z.enum(['chest', 'hybrid', 'mutation']),
    poolWorld: z.number().int().optional(),
    parents: z.array(z.string()).optional(),
    climateWorld: z.number().int().optional(),
    launch: z.boolean(),
  })
  .strict();
export type PlantRow = z.infer<typeof PlantRowSchema>;

export const DupeCurveRowSchema = z.object({ id: z.string(), copies: z.array(z.number().int().positive()) }).strict();

export const ChestRowSchema = z
  .object({
    id: z.string().regex(/^chest\.[a-z]+$/),
    tier: z.number().int(),
    cards: z.number().int().positive(),
    guarantee: z.array(rarity),
    odds: chestOdds,
    pollen: z.number(),
    heirloomChance: z.number().min(0).max(1),
    heirloomOdds: z.literal('starlight').optional(),
    /**
     * Design 0.5 chests (EXPANSION 4.3): one heirloom per entry, each at least the tier named, or
     * `any` for the chest's normal heirloom odds. Absent: one heirloom at heirloomChance.
     */
    heirloomSlots: z.array(rarity).optional(),
    /** Copies of a Head (GDD 8.3 rule 9). Each falls back to another Legendary slot while no world has 5 stars. */
    headCopies: z.number().int().nonnegative().optional(),
    /** Fixed extras, never rolled (EXPANSION 4.3): materials and cosmetics, kept in the item bag until their systems arrive. */
    extras: z.array(z.object({ item: z.string(), count: z.number().int().positive(), tier: rarity.optional() }).strict()).optional(),
  })
  .strict();
export type ChestRow = z.infer<typeof ChestRowSchema>;

/** Chests with fixed contents that the core hands out (welcome, hiring, seed packet). `tier` sets their look. */
export const SpecialChestRowSchema = z.object({ id: z.string().regex(/^chest\.[a-z_]+$/), tier: z.number().int().positive() }).strict();
export type SpecialChestRow = z.infer<typeof SpecialChestRowSchema>;

/** One rarity tier (tables/tiers.yaml; design 0.5, EXPANSION 2.1 and 4.1; style bible v1.7, 8 and 19). */
export const TierRowSchema = z
  .object({
    id: rarity,
    order: z.number().int().positive(),
    look: z.object({ main: z.string(), light: z.string(), dark: z.string(), flood: z.array(z.string()) }).strict(),
    emblem: z.string().nullable(),
    burst: z.string().nullable(),
    chest: z.string().nullable(),
    pips: z.number().int().positive(),
    chime: z.number().int().nonnegative(),
    sting: z.number().int().positive(),
    reveal: z
      .object({
        total: z.number().positive(),
        hold: z.number().nonnegative(),
        hops: z.number().int().nonnegative(),
        lift: z.boolean(),
        dim: z.number().min(0).max(1),
        blackout: z.number().nonnegative(),
        shake: z.number().nonnegative(),
        rays: z.boolean(),
        ring: z.boolean(),
        beam: z.boolean(),
        short: z.number().positive(),
      })
      .strict(),
    juice: z
      .object({ particles: z.number().int().nonnegative(), shake: z.number().nonnegative(), flash: z.number().min(0).max(1), pause: z.number().nonnegative(), layers: z.number().int().positive() })
      .strict(),
  })
  .strict();
export type TierRow = z.infer<typeof TierRowSchema>;

/** A big moment's tier (tables/moments.yaml; design 0.5, EXPANSION 4.2). The client turns it into one tiered effect. */
export const MomentRowSchema = z
  .object({
    id: z.string().regex(/^[a-z_]+$/),
    tier: rarity,
    form: z.enum(['short', 'full']),
    steps: z.array(z.object({ at: z.number(), tier: rarity }).strict()).optional(),
    every: z.object({ n: z.number().int().positive(), tier: rarity }).strict().optional(),
    cases: z.record(z.string(), rarity).optional(),
  })
  .strict();
export type MomentRow = z.infer<typeof MomentRowSchema>;

/** A tuning key or a plain number. */
const tuningRef = z.union([z.string().regex(/^[A-Z][A-Z0-9_]*$/), z.number()]);
const stepName = z.string().regex(/^[a-z][A-Za-z.]*$/);
const resetSteps = z.object({ save: z.array(stepName), world: z.array(stepName) }).strict();

/** A reset layer (tables/resets/layers.yaml; GDD 12, EXPANSION 7 and 15.1 item 6). The core runs its steps by name. */
export const ResetLayerRowSchema = z
  .object({
    id: z.string().regex(/^[a-z_]+$/),
    order: z.number().int().positive(),
    enabled: z.boolean(),
    scope: z.enum(['world', 'save']),
    currency: z.string().regex(/^[a-z_]+$/),
    gain: z
      .object({ source: stepName, claimed: stepName, base: tuningRef, exp: tuningRef, scale: z.string().nullable(), stat: z.string().nullable() })
      .strict(),
    claim: z.array(stepName),
    tally: z.array(stepName),
    times: stepName,
    first: tuningRef,
    needs: z.object({ topFloorOpen: z.boolean().optional(), worldReached: tuningRef.optional() }).strict(),
    grants: z.array(
      z
        .object({
          step: stepName,
          count: z.number().int().positive().optional(),
          chest: z.string().regex(/^chest\.[a-z_]+$/).optional(),
          first: z.string().regex(/^chest\.[a-z_]+$/).optional(),
          every: z.object({ n: z.number().int().positive(), chest: z.string().regex(/^chest\.[a-z_]+$/) }).strict().optional(),
          tier: rarity.optional(),
          onlyFirst: z.boolean().optional(),
        })
        .strict(),
    ),
    resets: resetSteps,
    keeps: resetSteps,
  })
  .strict();
export type ResetLayerRow = z.infer<typeof ResetLayerRowSchema>;

export const ArtifactRowSchema = z
  .object({
    id: z.string().regex(/^artifact\.[a-z_]+$/),
    n: z.number().int(),
    set: z.string(),
    rarity,
    passives: z.array(EffectSchema).min(1),
    ability: AbilitySchema.optional(),
  })
  .strict();
export type ArtifactRow = z.infer<typeof ArtifactRowSchema>;

export const SetRowSchema = z.object({ id: z.string(), two: EffectSchema, three: EffectSchema }).strict();
export type SetRow = z.infer<typeof SetRowSchema>;

export const SkillRowSchema = z
  .object({
    id: z.string().regex(/^skill\.(gt|bo|ty)\.[a-z_]+$/),
    branch: z.enum(['green_thumb', 'botanist', 'tycoon']),
    tier: z.number().int().min(1).max(4),
    ranks: z.number().int().positive(),
    major: z.boolean().optional(),
    keystone: z.boolean().optional(),
    effect: EffectSchema.optional(),
    special: z.string().optional(),
    params: z.record(z.number()).optional(),
  })
  .strict();
export type SkillRow = z.infer<typeof SkillRowSchema>;

export const ResearchRowSchema = z
  .object({
    id: z.string().regex(/^research\.[a-z]+\.[a-z0-9_]+$/),
    lane: z.enum(['tools', 'soil', 'botany', 'people']),
    requires: z.array(z.string()),
    needs: z.enum(['heirlooms', 'world2', 'world3']).optional(),
    cost: z.number().positive(),
    timeSec: z.number().positive(),
    effect: EffectSchema.optional(),
    special: z.string().optional(),
  })
  .strict();
export type ResearchRow = z.infer<typeof ResearchRowSchema>;

export const CompostShopRowSchema = z
  .object({
    id: z.string().regex(/^shop\.compost\.[a-z_]+$/),
    maxLevel: z.number().int().positive(),
    cost: z.object({ base: z.number().positive(), growth: z.number().gt(1) }).strict(),
    effect: EffectSchema.optional(),
    special: z.string().optional(),
    params: z.record(z.unknown()).optional(),
  })
  .strict();
export type CompostShopRow = z.infer<typeof CompostShopRowSchema>;

export const RibbonShopRowSchema = z
  .object({
    id: z.string().regex(/^shop\.ribbon\.[a-z0-9_]+$/),
    costs: z.array(z.number().positive()).optional(),
    endless: z.object({ base: z.number().positive(), growth: z.number().gt(1) }).strict().optional(),
    effect: EffectSchema.optional(),
    special: z.string().optional(),
  })
  .strict();
export type RibbonShopRow = z.infer<typeof RibbonShopRowSchema>;

export const StoryRowSchema = z
  .object({ n: z.number().int(), id: z.string(), goal: ConditionSchema, rewards: z.array(RewardSchema).optional(), xp: z.number(), launch: z.boolean().optional() })
  .strict();
export type StoryRow = z.infer<typeof StoryRowSchema>;

export const PoolQuestRowSchema = z.object({ id: z.string(), counter: z.string(), goal: z.number().positive(), needs: z.string().optional() }).strict();
export type PoolQuestRow = z.infer<typeof PoolQuestRowSchema>;

export const AchievementRowSchema = z.object({ id: z.string(), counter: z.string(), tiers: z.array(z.number()).length(5) }).strict();
export type AchievementRow = z.infer<typeof AchievementRowSchema>;

export const UnlockRowSchema = z
  .object({ n: z.number().int(), id: z.string().regex(/^feature\.[a-z0-9_]+$/), when: ConditionSchema, targetSec: z.number().nullable().optional(), targetDay: z.number().optional() })
  .strict();
export type UnlockRow = z.infer<typeof UnlockRowSchema>;

export const FairSchema = z
  .object({
    events: z.array(z.object({ id: z.string(), weekMod: z.number().int(), bonus: EffectSchema }).strict()),
    track: z.array(z.object({ step: z.number().int(), tickets: big, reward: RewardSchema }).strict()),
  })
  .strict();
export type FairTable = z.infer<typeof FairSchema>;

export const FloorTemplateSchema = z
  .object({
    ladder: z.number(),
    floor1: z.object({ basePayout: z.number(), baseCycleSec: z.number(), levelBaseCost: z.number(), growth: z.number(), hireFee: z.number() }).strict(),
    floor2: z.object({ openCost: z.number(), basePayout: z.number(), baseCycleSec: z.number(), levelBaseCost: z.number(), growth: z.number() }).strict(),
    payoutRatio: z.number(),
    levelCostRatio: z.number(),
    growthStep: z.number(),
    cycleDoubling: z.number(),
    hireRatio: z.array(z.number()),
    floors: z.record(z.array(z.object({ id: z.string(), favouredFamily: z.string() }).strict())),
  })
  .strict();

/** Everything the YAML tables hold, after validation and before big numbers are parsed. */
export const RawContentSchema = z
  .object({
    tuning: TuningSchema,
    tiers: z.array(TierRowSchema).min(1),
    moments: z.array(MomentRowSchema),
    worlds: z.array(WorldRowSchema),
    floors: z.array(FloorRowSchema),
    floorTemplate: FloorTemplateSchema,
    managers: z.array(ManagerRowSchema),
    traits: z.array(TraitRowSchema),
    plants: z.array(PlantRowSchema),
    dupeCurves: z.array(DupeCurveRowSchema),
    chests: z.array(ChestRowSchema),
    specialChests: z.array(SpecialChestRowSchema),
    resetLayers: z.array(ResetLayerRowSchema).min(1),
    artifacts: z.array(ArtifactRowSchema),
    sets: z.array(SetRowSchema),
    skills: z.array(SkillRowSchema),
    research: z.array(ResearchRowSchema),
    compostShop: z.array(CompostShopRowSchema),
    ribbonShop: z.array(RibbonShopRowSchema),
    story: z.array(StoryRowSchema),
    daily: z.array(PoolQuestRowSchema),
    weekly: z.array(PoolQuestRowSchema),
    achievements: z.array(AchievementRowSchema),
    unlocks: z.array(UnlockRowSchema),
    fair: FairSchema,
  })
  .strict();
export type RawContent = z.infer<typeof RawContentSchema>;
