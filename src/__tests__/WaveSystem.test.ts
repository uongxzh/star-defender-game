import { describe, it, expect } from 'vitest';
import { WaveSystem } from '../systems/WaveSystem';

describe('WaveSystem', () => {
  it('starts at wave 1 with correct enemy count', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();

    expect(wave.wave).toBe(1);
    expect(wave.totalEnemies).toBe(5);
    expect(wave.enemiesSpawned).toBe(0);
    expect(wave.spawning).toBe(true);
  });

  it('increases enemy count per wave', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();
    wave.enemiesSpawned = 5;
    wave.enemiesKilled = 5;
    wave.waveComplete = true;
    wave.waveTimer = 3000;
    wave.update(3000);

    expect(wave.wave).toBe(2);
    expect(wave.totalEnemies).toBe(7);
  });

  it('does not spawn beyond total enemies', () => {
    const spawned: string[] = [];
    const wave = new WaveSystem((type) => spawned.push(type));
    wave.startWave();

    for (let i = 0; i < 20; i++) {
      wave.update(2000);
    }

    expect(spawned.length).toBeLessThanOrEqual(wave.totalEnemies);
  });

  it('completes wave when all enemies killed', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();
    wave.enemiesSpawned = wave.totalEnemies;
    wave.enemiesKilled = wave.totalEnemies;
    wave.update(16);

    expect(wave.waveComplete).toBe(true);
  });
});
