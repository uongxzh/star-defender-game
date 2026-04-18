import { WAVE_CONFIG, ENEMY_TYPES } from '../utils/constants';

export class WaveSystem {
  wave = 0;
  enemiesSpawned = 0;
  enemiesKilled = 0;
  totalEnemies = 0;
  spawnTimer = 0;
  waveTimer = 0;
  waveComplete = false;
  spawning = false;

  private onSpawnEnemy: (type: keyof typeof ENEMY_TYPES, wave: number) => void;

  constructor(onSpawnEnemy: (type: keyof typeof ENEMY_TYPES, wave: number) => void) {
    this.onSpawnEnemy = onSpawnEnemy;
  }

  startWave() {
    this.wave++;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = WAVE_CONFIG.baseEnemies + this.wave * WAVE_CONFIG.enemyIncrement;
    this.spawnTimer = 0;
    this.waveTimer = 0;
    this.waveComplete = false;
    this.spawning = true;
  }

  update(dt: number) {
    if (!this.spawning) return;

    if (this.waveComplete) {
      this.waveTimer += dt;
      if (this.waveTimer >= WAVE_CONFIG.waveDelay) {
        this.startWave();
      }
      return;
    }

    if (this.enemiesSpawned >= this.totalEnemies) {
      if (this.enemiesKilled >= this.totalEnemies) {
        this.waveComplete = true;
        this.waveTimer = 0;
      }
      return;
    }

    this.spawnTimer += dt;
    const interval = Math.max(
      WAVE_CONFIG.minSpawnInterval,
      WAVE_CONFIG.spawnInterval - this.wave * 100
    );

    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    const type = this.selectEnemyType();
    this.onSpawnEnemy(type, this.wave);
    this.enemiesSpawned++;
  }

  private selectEnemyType(): keyof typeof ENEMY_TYPES {
    const roll = Math.random();
    if (this.wave >= 5 && roll < 0.15) return 'TANK';
    if (this.wave >= 3 && roll < 0.3) return 'FAST';
    return 'CHASER';
  }

  reset() {
    this.wave = 0;
    this.enemiesSpawned = 0;
    this.enemiesKilled = 0;
    this.totalEnemies = 0;
    this.spawnTimer = 0;
    this.waveTimer = 0;
    this.waveComplete = false;
    this.spawning = false;
  }

  getEnemyCountForWave(): number {
    return WAVE_CONFIG.baseEnemies + this.wave * WAVE_CONFIG.enemyIncrement;
  }
}
