/**
 * The floor template of GDD 5.3 as a pure function. Used by the generator
 * script for the committed tables and by the simulator to rebuild floors when
 * a proposal changes a world's cost scale or taper.
 */
import { Num } from '@sprout/core';

export interface FloorTemplate {
  ladder: number;
  floor1: { basePayout: number; baseCycleSec: number; levelBaseCost: number; growth: number; hireFee: number };
  floor2: { openCost: number; basePayout: number; baseCycleSec: number; levelBaseCost: number; growth: number };
  payoutRatio: number;
  levelCostRatio: number;
  growthStep: number;
  cycleDoubling: number;
  hireRatio: number[];
  floors: Record<string, { id: string; favouredFamily: string }[]>;
}

export interface GeneratedFloor {
  id: string;
  order: number;
  favouredFamily: string;
  openCost: Num;
  basePayout: Num;
  baseCycleSec: number;
  levelBaseCost: Num;
  growth: number;
  hireFee: Num;
}

export function generateFloors(t: FloorTemplate, world: { id: string; D: Num; T: number; floors: number }): GeneratedFloor[] {
  const ids = t.floors[world.id];
  if (!ids || ids.length !== world.floors) throw new Error(`floor template: ${world.id} needs ${world.floors} floor ids`);
  const out: GeneratedFloor[] = [];
  for (let n = 1; n <= world.floors; n++) {
    const meta = ids[n - 1]!;
    if (n === 1) {
      out.push({
        id: meta.id, order: 1, favouredFamily: meta.favouredFamily,
        openCost: Num.ZERO,
        basePayout: Num.from(t.floor1.basePayout),
        baseCycleSec: t.floor1.baseCycleSec,
        levelBaseCost: world.D.mul(t.floor1.levelBaseCost),
        growth: t.floor1.growth,
        hireFee: world.D.mul(t.floor1.hireFee),
      });
      continue;
    }
    // Unscaled open cost: 60 x 12^(n-2). Base payouts are NOT multiplied by D (GDD 5.3).
    const unscaledOpen = Num.pow(t.ladder, n - 2).mul(t.floor2.openCost);
    const openCost = unscaledOpen.mul(world.D);
    const basePayout = n === 2 ? Num.from(t.floor2.basePayout) : unscaledOpen.mul(t.payoutRatio).mul(Num.pow(world.T, n - 3));
    out.push({
      id: meta.id, order: n, favouredFamily: meta.favouredFamily,
      openCost,
      basePayout,
      baseCycleSec: t.floor2.baseCycleSec * t.cycleDoubling ** (n - 2),
      levelBaseCost: n === 2 ? world.D.mul(t.floor2.levelBaseCost) : openCost.mul(t.levelCostRatio),
      growth: Math.round((t.floor2.growth - t.growthStep * (n - 2)) * 1e6) / 1e6,
      hireFee: openCost.mul(t.hireRatio[n - 2]!),
    });
  }
  return out;
}
