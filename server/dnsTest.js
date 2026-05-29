const dns = require('dns');

console.log('--- Default DNS ---');
dns.resolveSrv('_mongodb._tcp.cluster0.m8hoiej.mongodb.net', (err, addresses) => {
    console.log('SRV:', err ? err.message : addresses);
});
dns.resolveTxt('cluster0.m8hoiej.mongodb.net', (err, addresses) => {
    console.log('TXT:', err ? err.message : addresses);
});

setTimeout(() => {
    console.log('\n--- Google DNS ---');
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    dns.resolveSrv('_mongodb._tcp.cluster0.m8hoiej.mongodb.net', (err, addresses) => {
        console.log('SRV:', err ? err.message : addresses);
    });
    dns.resolveTxt('cluster0.m8hoiej.mongodb.net', (err, addresses) => {
        console.log('TXT:', err ? err.message : addresses);
    });
}, 2000);
