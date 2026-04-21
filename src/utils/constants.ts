// WeaponKind defined locally (matches types.ts)
export type WeaponKind = 'firepower' | 'spread' | 'rapid' | 'pierce';

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

// POWERUP_TYPES — uppercase keys, duration included for shield
export const POWERUP_TYPES = {
  FIREPOWER: { name: 'firepower', color: '#f59e0b' },
  RAPID:     { name: 'rapid',     color: '#ec4899' },
  SPREAD:    { name: 'spread',    color: '#06b6d4' },
  PIERCE:    { name: 'pierce',    color: '#a855f7' },
  SHIELD:    { name: 'shield',    color: '#3b82f6', duration: 5000 },
} as const;

// ZX-9: Permanent weapon upgrade configs (keys match WeaponKind values from types.ts)
export const MAX_WEAPON_LEVEL = 3;
export const WEAPON_FULL_BONUS_SCORE = 500;

export const POWERUP_WEAPON_MAP: Record<string, WeaponKind> = {
  firepower: 'firepower',
  rapid: 'rapid',
  spread: 'spread',
  pierce: 'pierce',
};

export const WEAPON_CONFIGS: Record<WeaponKind, {
  name: string;
  nameCn: string;
  color: string;
  icon: string;
  maxLevel: number;
  fireRateMultiplier(level: number): number;
  bulletCount(level: number): number;
  piercing(level: number): number;
  spreadAngle(level: number): number;
}> = {
  firepower: {
    name: 'Firepower', nameCn: '火力', color: '#f59e0b', icon: '💥',
    maxLevel: 3,
    fireRateMultiplier: () => 1,
    bulletCount: (lv) => 1 + lv,
    piercing: () => 0,
    spreadAngle: () => 0.08,
  },
  spread: {
    name: 'Spread', nameCn: '散弹', color: '#06b6d4', icon: '🔥',
    maxLevel: 3,
    fireRateMultiplier: () => 1,
    bulletCount: (lv) => 1 + lv,
    piercing: () => 0,
    spreadAngle: (lv) => 0.2 + (lv - 1) * 0.15,
  },
  rapid: {
    name: 'Rapid', nameCn: '速射', color: '#ec4899', icon: '⚡',
    maxLevel: 3,
    fireRateMultiplier: (lv) => 1 / (1 + lv * 0.15),
    bulletCount: () => 1,
    piercing: () => 0,
    spreadAngle: () => 0.05,
  },
  pierce: {
    name: 'Pierce', nameCn: '穿透', color: '#a855f7', icon: '➤',
    maxLevel: 3,
    fireRateMultiplier: () => 1,
    bulletCount: () => 1,
    piercing: (lv) => lv,
    spreadAngle: () => 0.03,
  },
};

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
