import { describe, expect, it } from 'vitest';
import { renderLine } from '../src/core/template.js';

describe('renderLine', () => {
  it('substitutes tokens', () => {
    expect(renderLine('{a} {b}', { a: 'one', b: 'two' })).toBe('one two');
  });

  it('renders an unknown token as empty', () => {
    expect(renderLine('{a}{missing}', { a: 'one' })).toBe('one');
  });

  it('drops the separator left by an absent field', () => {
    expect(renderLine('[{ward}, {district}]', { ward: 'P.Ben Thanh' })).toBe('P.Ben Thanh');
    expect(renderLine('[{ward}, {district}]', { district: 'Q.1' })).toBe('Q.1');
  });

  it('drops an optional group whose fields are all empty', () => {
    expect(renderLine('[〒{postalCode}]', {})).toBe('');
    expect(renderLine('[〒{postalCode}]', { postalCode: '100-0001' })).toBe('〒100-0001');
  });

  it('drops a literal-only optional group', () => {
    expect(renderLine('[Singapore {postalCode}]', {})).toBe('');
  });

  it('keeps adjacent optional groups independent', () => {
    const template = '[{postalCode} {city}][ - {state}]';
    expect(renderLine(template, { postalCode: '01310-100', city: 'Sao Paulo', state: 'SP' })).toBe(
      '01310-100 Sao Paulo - SP',
    );
    expect(renderLine(template, { postalCode: '01310-100', city: 'Sao Paulo' })).toBe(
      '01310-100 Sao Paulo',
    );
    expect(renderLine(template, { state: 'SP' })).toBe('SP');
  });

  it('collapses repeated separators and runs of spaces', () => {
    expect(renderLine('{a},  , {b}', { a: 'one', b: 'two' })).toBe('one, two');
    expect(renderLine('{a} {b}', { a: 'one', b: 'two' })).toBe('one two');
  });

  it('trims edge punctuation', () => {
    expect(renderLine(', {a} -', { a: 'one' })).toBe('one');
    expect(renderLine('{a}、{b}', { a: 'one' })).toBe('one');
  });

  it('returns an empty string when nothing resolves', () => {
    expect(renderLine('{a}, {b}', {})).toBe('');
  });
});
