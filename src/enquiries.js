'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const runtimeDir = process.env.RUNTIME_DIR || path.join(process.cwd(), 'runtime');
const file = path.join(runtimeDir, 'enquiries.jsonl');

function clean(value, max = 1000) {
  return String(value || '').trim().replace(/\0/g, '').slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function save(input) {
  if (input.website) return { ok: true, id: crypto.randomUUID() };
  const name = clean(input.name, 120);
  const email = clean(input.email, 180).toLowerCase();
  const subject = clean(input.subject, 180);
  const message = clean(input.message, 5000);
  if (name.length < 2) throw new Error('Please enter your name.');
  if (!validEmail(email)) throw new Error('Please enter a valid email address.');
  if (message.length < 10) throw new Error('Please provide a little more information.');
  fs.mkdirSync(runtimeDir, { recursive: true });
  const row = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    email,
    company: clean(input.company, 180),
    country: clean(input.country, 100),
    subject,
    service: clean(input.service, 120),
    product: clean(input.product, 120),
    message,
    consent: Boolean(input.consent)
  };
  fs.appendFileSync(file, JSON.stringify(row) + '\n', { encoding: 'utf8', mode: 0o600 });
  return { ok: true, id: row.id };
}

function list(limit = 200) {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line)).slice(-limit).reverse();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

module.exports = { save, list };
