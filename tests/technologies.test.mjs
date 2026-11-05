import assert from 'node:assert/strict';
import test from 'node:test';
import { technologies } from '../src/data/technologies.ts';
import { validateTechnologies } from '../src/data/validateTechnologies.ts';

test('all shipped architectures have valid node and interface references', () => {
  assert.deepEqual(validateTechnologies(technologies), []);
});

test('invalid architecture data reports duplicate ids and broken references', () => {
  const brokenTechnology = {
    id: 'broken',
    label: 'Broken',
    summary: '',
    nodes: [
      { id: 'a', layer: 'ue', label: 'A', fullName: 'A', role: '', interfaces: [] },
      { id: 'a', layer: 'ran', label: 'A2', fullName: 'A2', role: '', interfaces: [] },
      { id: 'b', layer: 'core', label: 'B', fullName: 'B', role: '', interfaces: [] },
    ],
    links: [
      { id: 'link', from: 'a', to: 'missing' },
      { id: 'link', from: 'a', to: 'b', label: 'Unknown' },
    ],
  };

  const issues = validateTechnologies([brokenTechnology, brokenTechnology]);

  assert.ok(issues.includes('Duplicate technology id "broken".'));
  assert.ok(issues.includes('broken: duplicate node id "a".'));
  assert.ok(issues.includes('broken: duplicate link id "link".'));
  assert.ok(issues.includes('broken: link "link" references missing node "missing".'));
  assert.ok(issues.includes(
    'broken: interface "Unknown" is not listed on either endpoint of link "link".'
  ));
});