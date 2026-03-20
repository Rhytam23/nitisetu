const dns = require('dns');
const net = require('net');

const hosts = [
  'mysandbox.rmoycgw.mongodb.net',
  'atlas-qvniez.mongodb.net'
];

async function checkHost(host) {
  console.log(`\n--- Checking Host: ${host} ---`);
  
  // 1. DNS Lookup
  dns.lookup(host, (err, address, family) => {
    if (err) {
      console.error(`DNS Lookup Failed for ${host}:`, err.code);
    } else {
      console.log(`DNS Lookup Success: ${host} -> ${address} (v${family})`);
    }
  });

  // 2. Try to connect to common MongoDB ports (27017)
  const socket = new net.Socket();
  socket.setTimeout(8000);
  
  console.log(`Attempting TCP connection to ${host}:27017...`);
  
  socket.on('connect', () => {
    console.log(`TCP Connection Success: Successfully reached ${host}:27017`);
    socket.destroy();
  }).on('timeout', () => {
    console.error(`TCP Connection Timeout: Could not reach ${host}:27017 (Check IP Whitelist)`);
    socket.destroy();
  }).on('error', (err) => {
    console.error(`TCP Connection Failed for ${host}:27017:`, err.message);
  }).connect(27017, host);
}

hosts.forEach(checkHost);

// Wait for all to finish
setTimeout(() => {
  console.log("\n--- Done ---");
  process.exit(0);
}, 10000);
