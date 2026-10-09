import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const config = read('src/config/contact.ts');
const explore = read('app/explore.tsx');
const contact = read('app/contact.tsx');
const advertise = read('app/advertise.tsx');
const actions = read('src/features/contact/links.ts');

for (const address of [
  'https://laz1310.com',
  'https://www.facebook.com/laz1310',
  'https://www.instagram.com/laz1310am/',
  'https://wa.me/13132911310',
]) {
  assert.ok(config.includes(address), `Missing approved LA Z contact: ${address}`);
}

assert.match(config, /sales@laz1310\.com/);
assert.match(config, /Quiero promocionarme en LA Z 1310/);
assert.match(config, /Advertising with LA Z 1310/);
assert.match(explore, /route: '\/contact'/);
assert.match(explore, /route: '\/advertise'/);
assert.match(contact, /CONTACT_CHANNELS\.map/);
assert.match(advertise, /openAdvertisingEmail\(language\)/);
assert.match(actions, /Linking\.openURL\(advertisingMailto\(language\)\)/);
assert.doesNotMatch(config, /Support@neuromarket\.io/);
assert.doesNotMatch(config, /radioonlinehd|RadioOnlineHD|com\.lazradio/i);

console.info('LA Z Contact and advertising V1 checks passed.');
