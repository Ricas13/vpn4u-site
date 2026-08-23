# VPN4U website

Public-facing infrastructure storefront for `vpn4u.cc`.

## What it includes

- VPS, dedicated-server and VPN product catalogues
- supplier-neutral infrastructure positioning
- functional contact and order-request forms stored as local JSONL
- a transparent non-payment checkout preview
- merchant-review-friendly company, fulfilment, privacy, refund, abuse and acceptable-use information
- responsive frontend, CSP/security headers, sitemap and robots.txt
- Docker deployment
- optional read-only enquiry endpoint protected by a bearer token

## Run locally

```bash
npm install
npm test
npm start
```

Open `http://localhost:3000`.

## Docker

```bash
docker compose up -d --build
```

The compose file binds the service to `127.0.0.1:3000` for use behind a reverse proxy.

## Before formal merchant verification

Edit `src/site-config.js` and fill in the exact legal entity name, company number (if applicable), VAT number (if applicable), and registered/business address. Empty legal fields are not rendered, so the public site never displays fake placeholders.

The public catalogue is intentionally supplier-neutral. Product availability and final pricing should be checked against upstream capacity before an order is accepted.

## Enquiries

Form submissions are appended to `runtime/enquiries.jsonl`. Keep the `runtime` directory on a persistent volume and protect it with normal host permissions/backups.

Optional read-only access:

```bash
ADMIN_TOKEN='use-a-long-random-token' npm start
curl -H 'Authorization: Bearer use-a-long-random-token' http://127.0.0.1:3000/admin/enquiries
```

## Payment behaviour

No live payment processor is integrated. The checkout preview deliberately explains that availability is confirmed before payment and routes the customer back to the functional order-request flow.
