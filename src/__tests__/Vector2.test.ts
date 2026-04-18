import { describe, it, expect } from 'vitest';
import { Vector2 } from '../utils/Vector2';

describe('Vector2', () => {
  it('creates with default values', () => {
    const v = new Vector2();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it('adds vectors', () => {
    const a = new Vector2(1, 2);
    const b = new Vector2(3, 4);
    const c = a.add(b);
    expect(c.x).toBe(4);
    expect(c.y).toBe(6);
  });

  it('subtracts vectors', () => {
    const a = new Vector2(5, 5);
    const b = new Vector2(2, 3);
    const c = a.sub(b);
    expect(c.x).toBe(3);
    expect(c.y).toBe(2);
  });

  it('multiplies by scalar', () => {
    const v = new Vector2(2, 3).mul(2);
    expect(v.x).toBe(4);
    expect(v.y).toBe(6);
  });

  it('normalizes to unit length', () => {
    const v = new Vector2(3, 4).normalize();
    expect(v.magnitude()).toBeCloseTo(1);
  });

  it('handles zero vector normalization', () => {
    const v = new Vector2(0, 0).normalize();
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it('calculates distance', () => {
    const a = new Vector2(0, 0);
    const b = new Vector2(3, 4);
    expect(Vector2.distance(a, b)).toBe(5);
  });

  it('creates from angle', () => {
    const v = Vector2.fromAngle(0, 1);
    expect(v.x).toBeCloseTo(1);
    expect(v.y).toBeCloseTo(0);
  });

  it('limits magnitude', () => {
    const v = new Vector2(10, 0).limit(5);
    expect(v.magnitude()).toBe(5);
  });

  it('dot product works', () => {
    const a = new Vector2(1, 0);
    const b = new Vector2(0, 1);
    expect(a.dot(b)).toBe(0);
  });
});
