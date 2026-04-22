import { describe, it, expect } from 'vitest';
import { WaveSystem } from '../systems/WaveSystem';
import { WAVE_CONFIG } from '../utils/constants';

describe('WaveSystem', () => {
  it('starts at wave 1 with correct enemy count', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();

    expect(wave.wave).toBe(1);
    expect(wave.totalEnemies).toBe(WAVE_CONFIG.baseEnemies + WAVE_CONFIG.enemyIncrement);
    expect(wave.enemiesSpawned).toBe(0);
    expect(wave.spawning).toBe(true);
  });

  it('auto-starts next wave after waveDelay', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();
    wave.waveTimer = WAVE_CONFIG.waveDelay;
    wave.update(1);

    expect(wave.wave).toBe(2);
  });

  it('does not spawn beyond total enemies per wave', () => {
    const spawned: string[] = [];
    const wave = new WaveSystem((type) => spawned.push(type));
    wave.startWave();

    // 确保在 waveDelay 之内更新，不触发下一波
    const safeUpdates = Math.floor((WAVE_CONFIG.waveDelay - 1) / WAVE_CONFIG.spawnInterval);
    for (let i = 0; i < safeUpdates; i++) {
      wave.update(WAVE_CONFIG.spawnInterval);
    }

    expect(spawned.length).toBeLessThanOrEqual(wave.totalEnemies);
  });

  it('marks wave complete when all enemies spawned', () => {
    const wave = new WaveSystem(() => {});
    wave.startWave();
    wave.enemiesSpawned = wave.totalEnemies;
    wave.update(16);

    expect(wave.waveComplete).toBe(true);
  });

  it('does not wait for kills to start next wave', () => {
    const spawned: string[] = [];
    const wave = new WaveSystem((type) => spawned.push(type));
    wave.startWave();

    // 第一波敌人还没杀完，但超过20秒倒计时到了
    wave.enemiesSpawned = wave.totalEnemies;
    wave.enemiesKilled = 0;
    wave.waveTimer = WAVE_CONFIG.waveDelay;
    wave.update(1);

    expect(wave.wave).toBe(2);
  });
});
