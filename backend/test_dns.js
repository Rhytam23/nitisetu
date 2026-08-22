import dns from 'dns';

// Force Node.js to use Google DNS and Cloudflare DNS to bypass local router SRV blocking
dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.resolveSrv('_mongodb._tcp.cluster0.n9xvo6s.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('DNS SRV Resolution Error with 8.8.8.8:', err);
    } else {
        console.log('SUCCESS! Resolved Atlas Shard Addresses:', addresses);
    }
});
