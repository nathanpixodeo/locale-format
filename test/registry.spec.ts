import { describe, expect, it } from 'vitest';
import { defineCountry } from '../src/core/define.js';
import { genericCountrySpec } from '../src/core/fallback.js';
import { createRegistry } from '../src/core/registry.js';
import VN from '../src/data/countries/vn.js';
import US from '../src/data/countries/us.js';

describe('createRegistry', () => {
  it('starts empty when no specs are given', () => {
    expect(createRegistry().codes()).toEqual([]);
  });

  it('looks specs up case- and whitespace-insensitively', () => {
    const registry = createRegistry([VN]);
    expect(registry.get('vn')).toBe(VN);
    expect(registry.get(' Vn ')).toBe(VN);
    expect(registry.has('VN')).toBe(true);
    expect(registry.has('US')).toBe(false);
  });

  it('returns undefined from get for unknown or invalid codes', () => {
    const registry = createRegistry([VN]);
    expect(registry.get('XX')).toBeUndefined();
    expect(registry.get(undefined as unknown as string)).toBeUndefined();
  });

  it('lists codes sorted', () => {
    expect(createRegistry([VN, US]).codes()).toEqual(['US', 'VN']);
  });

  it('resolves an unknown country to the generic spec carrying that code', () => {
    const spec = createRegistry([VN]).resolve('xx');
    expect(spec.code).toBe('XX');
    expect(spec.addressFormat).toEqual(genericCountrySpec.addressFormat);
  });

  it('resolves an empty code to the generic spec itself', () => {
    expect(createRegistry().resolve('')).toBe(genericCountrySpec);
  });

  it('caches fallback specs so repeated lookups are identical', () => {
    const registry = createRegistry();
    expect(registry.resolve('XX')).toBe(registry.resolve('xx'));
  });

  it('bounds the fallback cache', () => {
    const registry = createRegistry();
    for (let i = 0; i < 200; i += 1) registry.resolve(`Q${i}`);
    // Beyond the limit specs are still correct, just not memoised.
    expect(registry.resolve('Q199').code).toBe('Q199');
  });

  it('registers and overrides specs, and is chainable', () => {
    const registry = createRegistry([VN]);
    const custom = defineCountry({ ...genericCountrySpec, code: 'XX', name: 'Xanadu' });
    expect(registry.register(custom)).toBe(registry);
    expect(registry.get('XX')).toBe(custom);
    expect(registry.resolve('XX').name).toBe('Xanadu');
  });

  it('keeps methods usable after destructuring', () => {
    const { register, get } = createRegistry();
    const custom = defineCountry({ ...genericCountrySpec, code: 'XX' });
    register(custom);
    expect(get('XX')).toBe(custom);
  });
});

describe('defineCountry', () => {
  it('returns the spec unchanged', () => {
    expect(defineCountry(VN)).toBe(VN);
  });
});
