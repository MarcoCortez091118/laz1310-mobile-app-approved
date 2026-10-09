import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const userFacingPaths = ['app', 'src/features/privacy'];
const forbidden = /Radio\s*Online\s*HD|radio-online-hd|com\.lazradio\.hdamfm/i;

function collect(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const file = join(path, entry.name);
    if (entry.isDirectory()) return collect(file);
    return /\.(ts|tsx)$/.test(entry.name) ? [file] : [];
  });
}

for (const file of userFacingPaths.flatMap(collect).concat('src/config/share.ts')) {
  const content = readFileSync(file, 'utf8');
  assert.equal(forbidden.test(content), false, `Outdated vendor identity in ${file}`);
}

const policy = readFileSync('src/features/privacy/policy.ts', 'utf8');
const support = readFileSync('src/config/support.ts', 'utf8');
const share = readFileSync('src/config/share.ts', 'utf8');
assert.match(policy, /neuromarket-laz1310-mobile-v1/);
assert.match(policy, /NEUROMARKET_PRIVACY_POLICY_ES/);
assert.match(policy, /NEUROMARKET_PRIVACY_POLICY_EN/);
assert.match(support, /Support@neuromarket\.io/);
assert.match(share, /https:\/\/www\.laz1310\.com\//);
assert.doesNotMatch(share, /play\.google\.com/);
console.info('NeuroMarket public identity checks passed.');
