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
for (const file of ['views/legal/terms.ejs','views/legal/privacy.ejs','views/legal/acceptable-use.ejs','views/legal/refunds.ejs','views/legal/delivery.ejs','views/legal/cookies.ejs','views/legal/abuse.ejs']) {
  assert(fs.existsSync(path.join(process.cwd(), file)), `Missing ${file}`);
}
const footer = fs.readFileSync(path.join(process.cwd(), 'views/partials/footer.ejs'), 'utf8');
assert(footer.includes('established datacentre and network partners'), 'Reseller/partner disclosure must remain visible');
assert(footer.includes('/legal/delivery'), 'Delivery and provisioning policy must remain linked from the footer');
assert(!footer.includes('Hetzner') && !footer.includes('Leaseweb'), 'Public footer must stay supplier-neutral');
const allPublic = ['views/home.ejs','views/products.ejs','views/infrastructure.ejs','views/about.ejs','views/faq.ejs','views/contact.ejs','src/catalogue.js'].map(f=>fs.readFileSync(path.join(process.cwd(),f),'utf8')).join('\n');
assert(!/Hetzner|Leaseweb/i.test(allPublic), 'Public-facing catalogue must remain supplier-neutral');
const faq = fs.readFileSync(path.join(process.cwd(), 'views/faq.ejs'), 'utf8');
assert((faq.match(/<summary>/g) || []).length >= 25, 'FAQ must remain substantial enough to answer common pre-sale and policy questions');
const products = fs.readFileSync(path.join(process.cwd(), 'views/products.ejs'), 'utf8');
for (const phrase of ['VPS FAQ','Dedicated FAQ','VPN FAQ']) assert(products.includes(phrase), `Product page is missing ${phrase}`);
const server = fs.readFileSync(path.join(process.cwd(), 'src/server.js'), 'utf8');
assert(server.includes("'/legal/delivery'"), 'Delivery policy route must remain mounted');
assert(server.includes("'/legal/delivery', '/legal/cookies'"), 'Delivery policy must remain in the public sitemap');
console.log('VPN4U site checks passed.');
