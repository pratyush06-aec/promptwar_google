const WebSocket = require('ws');

const WS_URL = 'ws://localhost:3000';
const ws = new WebSocket(WS_URL);

ws.on('open', () => {
    console.log('Connected to Nexus Backend. Pushing mock camera & IPS data...');

    setInterval(() => {
        const payload = {
            type: 'HARDWARE_UPDATE',
            data: {
                queueTimes: {
                    gate3: Math.floor(Math.random() * 20) + 1,
                    gate5: Math.floor(Math.random() * 5) + 1,
                    washroomA: Math.floor(Math.random() * 8) + 1
                },
                crowdLevels: {
                    sectorA: 'low',
                    sectorB: Math.random() > 0.8 ? 'high' : 'medium'
                }
            }
        };
        ws.send(JSON.stringify(payload));
        console.log('Emitted HW Update:', payload.data);
    }, 5000); // Emits every 5 seconds
});

ws.on('error', (err) => console.error('Connection error:', err));
