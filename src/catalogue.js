'use strict';

const vps = [
  { slug: 'cloud-4', name: 'Cloud 4', featured: false, price: 7.99, setup: 0, cpu: '4 vCPU', ram: '6 GiB RAM', storage: '100 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'A fast starter VPS for websites, development environments and lightweight services.' },
  { slug: 'cloud-6', name: 'Cloud 6', featured: true, price: 15.99, setup: 0, cpu: '6 vCPU', ram: '16 GiB RAM', storage: '200 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'Balanced compute and memory for production websites, application servers and small databases.' },
  { slug: 'cloud-8', name: 'Cloud 8', featured: false, price: 24.99, setup: 0, cpu: '8 vCPU', ram: '24 GiB RAM', storage: '300 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'More headroom for busy applications, API workloads and multi-service deployments.' },
  { slug: 'cloud-12', name: 'Cloud 12', featured: false, price: 44.99, setup: 0, cpu: '12 vCPU', ram: '48 GiB RAM', storage: '400 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'High-capacity virtual compute for larger application stacks and demanding databases.' },
  { slug: 'cloud-16', name: 'Cloud 16', featured: false, price: 69.99, setup: 0, cpu: '16 vCPU', ram: '64 GiB RAM', storage: '500 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'Serious virtual compute for sustained workloads, containers and multi-tenant applications.' },
  { slug: 'cloud-24', name: 'Cloud 24', featured: false, price: 119.99, setup: 0, cpu: '24 vCPU', ram: '120 GiB RAM', storage: '600 GB NVMe', traffic: '30 TB outbound', network: 'Up to 10 Gbps uplink', ip: '1 IPv4 + IPv6', regions: 'Europe, North America & Asia-Pacific', description: 'Maximum VPS capacity for memory-heavy services and complex production environments.' }
];

const dedicated = [
  { slug: 'core-8', name: 'Core 8', featured: true, price: 119, setup: 59, cpu: 'AMD Ryzen 7 PRO 8700GE', cores: '8 cores / 16 threads', ram: '64 GB DDR5', storage: '2 × 512 GB NVMe', traffic: 'Unlimited traffic', network: 'Dedicated 1 Gbps uplink', ip: 'IPv4 + /64 IPv6', regions: 'Germany or Finland', description: 'Modern dedicated compute for web hosting, game services, databases and general production workloads.' },
  { slug: 'performance-16', name: 'Performance 16', featured: false, price: 299, setup: 149, cpu: 'AMD Ryzen 9 7950X3D', cores: '16 cores / 32 threads', ram: '128 GB DDR5', storage: '2 × 1.92 TB NVMe Datacenter SSD', traffic: 'Unlimited traffic', network: 'Dedicated 1 Gbps uplink', ip: 'IPv4 + /64 IPv6', regions: 'Germany or Finland', description: 'High-frequency dedicated performance for databases, virtualisation and compute-heavy applications.' },
  { slug: 'performance-16-ecc', name: 'Performance 16 ECC', featured: false, price: 629, setup: 299, cpu: 'AMD Ryzen 9 7950X3D', cores: '16 cores / 32 threads', ram: '192 GB DDR5 ECC', storage: '2 × 1.92 TB NVMe Datacenter SSD', traffic: 'Unlimited traffic', network: 'Dedicated 1 Gbps uplink', ip: 'IPv4 + /64 IPv6', regions: 'Germany or Finland', description: 'Expanded ECC memory for dense virtualisation, data platforms and memory-intensive production workloads.' },
  { slug: 'epyc-48', name: 'EPYC 48', featured: false, price: 699, setup: 349, cpu: 'AMD EPYC 9454P', cores: '48 cores / 96 threads', ram: '128 GB DDR5 ECC', storage: '2 × 3.84 TB NVMe Datacenter SSD', traffic: 'Unlimited traffic', network: 'Dedicated 1 Gbps uplink', ip: 'IPv4 + /64 IPv6', regions: 'Germany or Finland', description: 'Enterprise-class core density for virtualisation hosts, build farms and sustained parallel workloads.' }
];

const vpn = [
  { slug: 'vpn-monthly', name: 'Private VPN Monthly', featured: false, price: 4.99, term: 'month', devices: 'Up to 5 devices', protocols: 'WireGuard & OpenVPN', bandwidth: 'No fixed bandwidth cap', regions: 'Multiple European and international exit locations', support: 'Standard email support', description: 'Simple encrypted internet access for everyday privacy on desktop and mobile.' },
  { slug: 'vpn-yearly', name: 'Private VPN Annual', featured: true, price: 39.99, term: 'year', devices: 'Up to 5 devices', protocols: 'WireGuard & OpenVPN', bandwidth: 'No fixed bandwidth cap', regions: 'Multiple European and international exit locations', support: 'Standard email support', description: 'Our best-value personal VPN plan with one annual billing period.' },
  { slug: 'vpn-business', name: 'Business VPN', featured: false, price: 14.99, term: 'month', devices: 'Up to 10 devices', protocols: 'WireGuard & OpenVPN', bandwidth: 'No fixed bandwidth cap', regions: 'European and international exit locations', support: 'Priority email support', description: 'Private connectivity for small teams that need more devices and priority assistance.' }
];

const collections = { vps, dedicated, vpn };

function findProduct(type, slug) {
  const list = collections[type];
  if (!list) return null;
  return list.find(item => item.slug === slug) || null;
}

module.exports = { ...collections, collections, findProduct };
