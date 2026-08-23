'use strict';

const express = require('express');
const helmet = require('helmet');
const path = require('path');
const crypto = require('crypto');
const site = require('./site-config');
const catalogue = require('./catalogue');
const enquiries = require('./enquiries');

const app = express();
const port = Number(process.env.PORT || 3000);
const trustProxy = process.env.TRUST_PROXY === '1';
if (trustProxy) app.set('trust proxy', 1);

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  crossOriginEmbedderPolicy: false
}));
app.use(express.urlencoded({ extended: false, limit: '32kb' }));
app.use(express.static(path.join(process.cwd(), 'public'), { maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0 }));

const attemptMap = new Map();
function enquiryRateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const previous = attemptMap.get(key) || [];
  const recent = previous.filter(ts => now - ts < windowMs);
  if (recent.length >= 6) return res.status(429).render('message', page(req, {
    title: 'Too many requests',
    eyebrow: 'Please try again shortly',
    heading: 'We could not accept another enquiry yet.',
    body: 'To protect the website from automated abuse, enquiry submissions are temporarily limited from this connection.'
  }));
  recent.push(now);
  attemptMap.set(key, recent);
  next();
}

function absolute(pathname = '/') {
  const base = (process.env.PUBLIC_URL || `https://${site.domain}`).replace(/\/$/, '');
  return base + (pathname.startsWith('/') ? pathname : `/${pathname}`);
}

function page(req, extra = {}) {
  return {
    site,
    catalogue,
    path: req.path,
    canonical: absolute(req.path),
    title: extra.title || site.brand,
    description: extra.description || site.description,
    ...extra
  };
}

function render(req, res, view, extra = {}, status = 200) {
  return res.status(status).render(view, page(req, extra));
}

app.get('/healthz', (_req, res) => res.type('text').send('ok'));

app.get('/', (req, res) => render(req, res, 'home', {
  title: 'VPN4U — VPS, Dedicated Servers & Private VPN',
  description: 'VPS hosting, dedicated compute and private VPN connectivity from an independent UK-based service provider.'
}));
app.get('/vps', (req, res) => render(req, res, 'products', {
  title: 'Virtual Private Servers | VPN4U',
  description: 'NVMe VPS hosting with clear resource specifications, global region options and availability confirmed before payment.',
  heading: 'Virtual private servers',
  eyebrow: 'Fast NVMe compute',
  intro: 'Straightforward VPS hosting with generous traffic, modern processors and global deployment options.',
  type: 'vps',
  products: catalogue.vps,
  note: 'VPS availability, location and exact deployment time are confirmed when we accept your order.'
}));
app.get('/dedicated', (req, res) => render(req, res, 'products', {
  title: 'Dedicated Servers | VPN4U',
  description: 'AMD dedicated servers with NVMe storage, full system control and stock confirmed before payment.',
  heading: 'Dedicated servers',
  eyebrow: 'Bare-metal performance',
  intro: 'Dedicated AMD compute with NVMe storage, full root access and predictable monthly pricing.',
  type: 'dedicated',
  products: catalogue.dedicated,
  note: 'Dedicated hardware is subject to live stock. We confirm availability before accepting an order.'
}));
app.get('/vpn', (req, res) => render(req, res, 'products', {
  title: 'Private VPN Service | VPN4U',
  description: 'Private VPN connectivity for personal devices and small teams using established encrypted VPN protocols.',
  heading: 'Private VPN',
  eyebrow: 'Encrypted connectivity',
  intro: 'Simple encrypted internet connectivity for personal devices and small teams.',
  type: 'vpn',
  products: catalogue.vpn,
  note: 'VPN access is intended for lawful use and remains subject to our Acceptable Use Policy.'
}));

app.get('/infrastructure', (req, res) => render(req, res, 'infrastructure', { title: 'Infrastructure & Network | VPN4U', description: 'How VPN4U sources and delivers virtual, dedicated and VPN infrastructure through established datacentre and network partners.' }));
app.get('/about', (req, res) => render(req, res, 'about', { title: 'About VPN4U', description: 'Learn how VPN4U provides supplier-neutral VPS, dedicated server and private VPN services.' }));
app.get('/faq', (req, res) => render(req, res, 'faq', { title: 'Frequently Asked Questions | VPN4U', description: 'Answers about VPN4U orders, VPS hosting, dedicated servers, VPN service, provisioning, billing, support and policies.' }));
app.get('/contact', (req, res) => render(req, res, 'contact', { title: 'Contact VPN4U', description: 'Contact VPN4U sales, support, abuse or privacy teams.' }));
app.post('/contact', enquiryRateLimit, (req, res) => {
  try {
    const result = enquiries.save(req.body);
    return render(req, res, 'message', {
      title: 'Enquiry received | VPN4U',
      eyebrow: 'Reference ' + result.id.slice(0, 8).toUpperCase(),
      heading: 'Thanks — your enquiry has been recorded.',
      body: `We will review the request and respond using the email address you supplied. For urgent service matters, contact ${site.emails.support}.`
    });
  } catch (error) {
    return render(req, res, 'contact', { title: 'Contact VPN4U', formError: error.message, form: req.body }, 400);
  }
});

app.get('/order/:type/:slug', (req, res) => {
  const product = catalogue.findProduct(req.params.type, req.params.slug);
  if (!product) return render(req, res, '404', { title: 'Product not found | VPN4U' }, 404);
  return render(req, res, 'order', { title: `Order ${product.name} | VPN4U`, type: req.params.type, product });
});
app.post('/order/:type/:slug', enquiryRateLimit, (req, res) => {
  const product = catalogue.findProduct(req.params.type, req.params.slug);
  if (!product) return render(req, res, '404', { title: 'Product not found | VPN4U' }, 404);
  try {
    const result = enquiries.save({ ...req.body, service: req.params.type, product: product.name, subject: `Order request: ${product.name}` });
    return res.redirect(303, `/order-received?ref=${encodeURIComponent(result.id.slice(0, 8).toUpperCase())}`);
  } catch (error) {
    return render(req, res, 'order', { title: `Order ${product.name} | VPN4U`, type: req.params.type, product, formError: error.message, form: req.body }, 400);
  }
});
app.get('/order-received', (req, res) => render(req, res, 'message', {
  title: 'Order request received | VPN4U',
  eyebrow: req.query.ref ? `Reference ${String(req.query.ref).slice(0, 12)}` : 'Order request received',
  heading: 'Your request is with us.',
  body: 'We confirm availability and the final service configuration before any payment is requested. Once approved, we will contact you with the next step.'
}));
app.get('/checkout/:type/:slug', (req, res) => {
  const product = catalogue.findProduct(req.params.type, req.params.slug);
  if (!product) return render(req, res, '404', { title: 'Product not found | VPN4U' }, 404);
  return render(req, res, 'checkout', { title: `Checkout — ${product.name} | VPN4U`, type: req.params.type, product });
});

app.get('/legal/terms', (req, res) => render(req, res, 'legal/terms', { title: 'Terms of Service | VPN4U' }));
app.get('/legal/privacy', (req, res) => render(req, res, 'legal/privacy', { title: 'Privacy Policy | VPN4U' }));
app.get('/legal/acceptable-use', (req, res) => render(req, res, 'legal/acceptable-use', { title: 'Acceptable Use Policy | VPN4U' }));
app.get('/legal/refunds', (req, res) => render(req, res, 'legal/refunds', { title: 'Cancellation & Refund Policy | VPN4U' }));
app.get('/legal/delivery', (req, res) => render(req, res, 'legal/delivery', { title: 'Delivery & Provisioning Policy | VPN4U' }));
app.get('/legal/cookies', (req, res) => render(req, res, 'legal/cookies', { title: 'Cookie Policy | VPN4U' }));
app.get('/legal/abuse', (req, res) => render(req, res, 'legal/abuse', { title: 'Abuse Reporting | VPN4U' }));

app.get('/robots.txt', (_req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${absolute('/sitemap.xml')}\n`));
app.get('/sitemap.xml', (_req, res) => {
  const routes = ['/', '/vps', '/dedicated', '/vpn', '/infrastructure', '/about', '/faq', '/contact', '/legal/terms', '/legal/privacy', '/legal/acceptable-use', '/legal/refunds', '/legal/delivery', '/legal/cookies', '/legal/abuse'];
  const urls = routes.map(route => `<url><loc>${absolute(route)}</loc></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
});

function adminAuthorized(req) {
  const configured = String(process.env.ADMIN_TOKEN || '');
  if (configured.length < 24) return false;
  const supplied = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(configured);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
app.get('/admin/enquiries', (req, res) => {
  if (!adminAuthorized(req)) return res.status(404).send('Not found');
  return res.json({ enquiries: enquiries.list(200) });
});

app.use((req, res) => render(req, res, '404', { title: 'Page not found | VPN4U' }, 404));
app.use((error, req, res, _next) => {
  console.error(error);
  return render(req, res, '500', { title: 'Service error | VPN4U' }, 500);
});

if (require.main === module) {
  app.listen(port, '0.0.0.0', () => console.log(`VPN4U site listening on :${port}`));
}

module.exports = app;
