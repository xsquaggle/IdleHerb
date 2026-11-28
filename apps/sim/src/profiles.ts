/**
 * The three player profiles of GDD 17.6, plus the choices a profile makes that
 * the GDD leaves to the player (skill order, which heirlooms to wear).
 */
export type ProfileId = 'active' | 'mixed' | 'idle';

export interface Profile {
  id: ProfileId;
  label: string;
  sessionsPerDay: number;
  sessionSec: number;
  firstSessionSec: number;
  /** Share of each session spent tapping. */
  tapShare: number;
  /** Share of an unmanaged floor's output the player collects while the game is open. */
  harvestShare: number;
  /** Share of Garden Visitors caught while the game is open. */
  visitorShare: number;
  /** Share of sunrises caught and of tapping time given to the weekend stall. */
  twistShare: number;
  fairTapShare: number;
  /** How much the profile values tap bonuses and offline bonuses when choosing heirlooms (0 to 1). */
  tapWeight: number;
  offlineWeight: number;
  /** Skills in the order the profile buys them. The first one that can be bought is bought. */
  skillOrder: string[];
}

const GT = ['firm_grip', 'keep_the_rhythm', 'big_bumpers', 'bumper_crop', 'long_spurt', 'second_wind', 'steady_hands', 'sprout_spotter'].map((s) => `skill.gt.${s}`);
const TY = ['good_bookkeeping', 'early_shift', 'bulk_discount', 'even_rows', 'night_owl', 'compost_connoisseur', 'deep_pantry', 'warm_welcome'].map((s) => `skill.ty.${s}`);
const BO = ['people_person', 'green_fingers', 'lucky_dip', 'quick_study', 'home_soil', 'curator', 'pollinator', 'bench_hand'].map((s) => `skill.bo.${s}`);

export const PROFILES: Record<ProfileId, Profile> = {
  active: {
    id: 'active',
    label: 'Active',
    sessionsPerDay: 6,
    sessionSec: 1800,
    firstSessionSec: 3600,
    tapShare: 1,
    harvestShare: 0.9,
    visitorShare: 1,
    twistShare: 1,
    fairTapShare: 0.2,
    tapWeight: 0.6,
    offlineWeight: 0.1,
    skillOrder: [...GT, 'skill.gt.thunder_thumb', ...TY, 'skill.ty.autopilot', ...BO, 'skill.bo.star_pupil'],
  },
  mixed: {
    id: 'mixed',
    label: 'Mixed',
    sessionsPerDay: 8,
    sessionSec: 360,
    firstSessionSec: 1800,
    tapShare: 0.5,
    harvestShare: 0.6,
    visitorShare: 0.5,
    twistShare: 0.5,
    fairTapShare: 0.2,
    tapWeight: 0.3,
    offlineWeight: 0.5,
    skillOrder: [
      'skill.ty.good_bookkeeping', 'skill.gt.firm_grip', 'skill.gt.keep_the_rhythm', 'skill.ty.night_owl', 'skill.ty.early_shift', 'skill.ty.bulk_discount',
      'skill.ty.even_rows', 'skill.gt.big_bumpers', 'skill.gt.bumper_crop', 'skill.gt.long_spurt', 'skill.ty.compost_connoisseur', 'skill.ty.deep_pantry',
      'skill.ty.warm_welcome', 'skill.ty.autopilot', 'skill.gt.second_wind', 'skill.gt.steady_hands', 'skill.gt.sprout_spotter', 'skill.gt.golden_touch',
      ...BO, 'skill.bo.star_pupil',
    ],
  },
  idle: {
    id: 'idle',
    label: 'Idle',
    sessionsPerDay: 3,
    sessionSec: 240,
    firstSessionSec: 900,
    tapShare: 0,
    harvestShare: 0.35,
    visitorShare: 0.25,
    twistShare: 0.25,
    fairTapShare: 0,
    tapWeight: 0,
    offlineWeight: 1,
    skillOrder: [
      'skill.ty.good_bookkeeping', 'skill.ty.night_owl', 'skill.ty.early_shift', 'skill.ty.bulk_discount', 'skill.ty.even_rows', 'skill.ty.deep_pantry',
      'skill.ty.compost_connoisseur', 'skill.ty.warm_welcome', 'skill.ty.compound_interest', ...BO, 'skill.bo.companion_planting', ...GT, 'skill.gt.golden_touch',
    ],
  },
};

/** How a simulated player handles the controls. */
export interface PlayStyle {
  /** Taps per second while tapping: HOLD_RATE (6) or TAP_RATE_CAP (12). */
  tapRate: number;
  /**
   * perfect: buys the instant something is worth buying, with no limit on clicks.
   * human:   a new player. About half speed for the first ten minutes and
   *          two thirds speed for the rest of the first hour (GDD 17.6), then
   *          a steady two purchases a second.
   */
  skill: 'perfect' | 'human';
  /** Hold timed abilities and fire them together with a Growth Spurt (the burst the audit worried about). */
  burst: boolean;
  /** Replant when pending Compost is at least this multiple of the era's Compost (GDD 17.6 uses 1). */
  replantFrac: number;
  /** Hold a Festival when pending Ribbons are at least this multiple of the Ribbons earned so far. */
  festivalFrac: number;
  /**
   * Systems the player ignores, for "what is this system worth" runs:
   * skills, plants, abilities, cardLevels, heirlooms, research, visitors,
   * shopExtras, spurt, chests, twists, or the id of one shop row.
   */
  off: string[];
}

export const DEFAULT_STYLE: PlayStyle = { tapRate: 6, skill: 'human', burst: false, replantFrac: 1, festivalFrac: 1, off: [] };
