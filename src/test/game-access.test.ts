import { describe, expect, it } from 'vitest';
import { canAccessSource } from '@/lib/game-access';
describe('Game source access', () => {
  it('lets local visitors access the 3kh0 games', () => { expect(canAccessSource('3kh0', null)).toBe(true); });
  it('locks LuminSDK for local visitors', () => { expect(canAccessSource('lumin', null)).toBe(false); });
  it('unlocks LuminSDK for signed-in accounts', () => { expect(canAccessSource('lumin', 'player-id')).toBe(true); });
});