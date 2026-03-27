import { describe, it, expect } from 'vitest';
import { formatFactoryVersion } from '@/src/lib/factory-v3-test';

describe('formatFactoryVersion', () => {
  it('retourne la version formatee de la factory', () => {
    expect(formatFactoryVersion()).toBe('SEDIPEC Factory v3.0');
  });
});
