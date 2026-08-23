'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const catalogue = require('../src/catalogue');
const site = require('../src/site-config');

for (const file of ['src/server.js','src/catalogue.js','src/site-config.js','src/enquiries.js','public/js/site.js']) {
  execFileSync(process.execPath, ['--check', path.join(process.cwd(), file)], { stdio: 'pipe' });
}
assert(site.domain === 'vpn4u.cc');
assert(catalogue.vps.length >= 4, 'VPS catalogue must be populated');
assert(catalogue.dedicated.length >= 3, 'Dedicated catalogue must be populated');
assert(catalogue.vpn.length >= 2, 'VPN catalogue must be populated');
for (const [type, products] of Object.entries(catalogue.collections)) {
  for (const product of products) {
    assert(product.slug && product.name && Number(product.price) > 0, `${type} product is incomplete`);
    assert(catalogue.findProduct(type, product.slug) === product, `${type}/${product.slug} lookup failed`);
  }
}
for (const file of ['views/legal/terms.ejs','views/legal/privacy.ejs','views/legal/acceptable-use.ejs','views/legal/refunds.ejs','views/legal/abuse.ejs']) {
  assert(fs.existsSync(path.join(process.cwd(), file)), `Missing ${file}`);
}
const footer = fs.readFileSync(path.join(process.cwd(), 'views/partials/footer.ejs'), 'utf8');
assert(footer.includes('established datacentre and network partners'), 'Reseller/partner disclosure must remain visible');
assert(!footer.includes('Hetzner') && !footer.includes('Leaseweb'), 'Public footer must stay supplier-neutral');
const allPublic = ['views/home.ejs','views/products.ejs','views/infrastructure.ejs','views/about.ejs','src/catalogue.js'].map(f=>fs.readFileSync(path.join(process.cwd(),f),'utf8')).join('\n');
assert(!/Hetzner|Leaseweb/i.test(allPublic), 'Public-facing catalogue must remain supplier-neutral');
console.log('VPN4U site checks passed.');
