import assert from 'node:assert/strict';
import test from 'node:test';
import { parseAppSelection, selectTechnology, serializeAppSelection } from '../src/appState.ts';
import { technologies } from '../src/data/technologies.ts';

test('parses a shared URL with a valid technology and node', () => {
  assert.deepEqual(
    parseAppSelection('?tech=5g-sa&node=amf', technologies, '4g'),
    { technologyId: '5g-sa', nodeId: 'amf' }
  );
});

test('falls back to the default technology and clears an invalid node', () => {
  assert.deepEqual(
    parseAppSelection('?tech=unknown&node=not-a-node', technologies, '4g'),
    { technologyId: '4g', nodeId: null }
  );
});

test('switching technology clears the previous node selection', () => {
  assert.deepEqual(selectTechnology('5g-sa'), { technologyId: '5g-sa', nodeId: null });
});

test('serializes the current selection for sharing', () => {
  assert.equal(serializeAppSelection('5g-sa', 'amf'), '?tech=5g-sa&node=amf');
  assert.equal(serializeAppSelection('4g', null), '?tech=4g');
});