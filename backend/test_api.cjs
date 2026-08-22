const http = require('http');

const data = JSON.stringify({
    state: "Rajasthan",
    land_acres: 1.5,
    crop: "Wheat",
    social_category: "General",
    scheme: "PM-KISAN"
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/check',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
