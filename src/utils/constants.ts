export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const TARGET_FPS = 60;
export const FIXED_DT = 1000 / TARGET_FPS;

export const PLAYER_SPEED = 300;
export const PLAYER_MAX_HEALTH = 100;
export const PLAYER_FIRE_RATE = 200;
export const PLAYER_INVINCIBLE_TIME = 1000;

export const BULLET_SPEED = 600;
export const BULLET_LIFETIME = 2000;

export const ENEMY_TYPES = {
  CHASER: {
    name: 'chaser',
    speed: 150,
    health: 30,
    damage: 10,
    score: 10,
    radius: 16,
    color: '#ef4444',
  },
  TANK: {
    name: 'tank',
    speed: 80,
    health: 80,
    damage: 20,
    score: 25,
    radius: 24,
    color: '#a855f7',
  },
  FAST: {
    name: 'fast',
    speed: 280,
    health: 15,
    damage: 5,
    score: 15,
    radius: 12,
    color: '#22c55e',
  },
} as const;

export const POWERUP_TYPES = {
  DOUBLE_SHOT: { name: 'double_shot', color: '#f59e0b', duration: 8000 },
  TRIPLE_SHOT: { name: 'triple_shot', color: '#06b6d4', duration: 6000 },
  RAPID_FIRE: { name: 'rapid_fire', color: '#ec4899', duration: 5000 },
  SHIELD: { name: 'shield', color: '#3b82f6', duration: 5000 },
} as const;

export const WAVE_CONFIG = {
  baseEnemies: 3,
  enemyIncrement: 2,
  spawnInterval: 1500,
  minSpawnInterval: 400,
  waveDelay: 3000,
};

export const COLORS = {
  background: '#0f172a',
  player: '#3b82f6',
  playerGlow: '#60a5fa',
  bullet: '#fbbf24',
  particleExplosion: ['#ef4444', '#f97316', '#fbbf24', '#ffffff'],
  particleTrail: '#60a5fa',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  uiPanel: 'rgba(15, 23, 42, 0.85)',
  healthBar: '#22c55e',
  healthBarBg: '#334155',
};
