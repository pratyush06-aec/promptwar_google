const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');
const authRouter = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '/public'));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let venueData = {
    crowdLevels: {},
    queueTimes: {},
    aiPredictions: {}
};

// WebSocket Broadcast
wss.on('connection', (ws) => {
    console.log('Client connected to Event Stream.');
    ws.send(JSON.stringify({ type: 'INIT', data: venueData }));

    // Internal Hardware Mocking loop for Cloud Deployments
    setInterval(async () => {
        const payload = {
            queueTimes: {
                gate3: Math.floor(Math.random() * 20) + 1,
                gate5: Math.floor(Math.random() * 5) + 1,
                washroomA: Math.floor(Math.random() * 8) + 1
            },
            crowdLevels: {
                sectorA: 'low',
                sectorB: Math.random() > 0.8 ? 'high' : 'medium'
            }
        };
        
        venueData.queueTimes = payload.queueTimes;
        venueData.crowdLevels = payload.crowdLevels;
        
        try {
            const aiEndpoint = process.env.AI_URL || 'http://127.0.0.1:8000/predict_crowd';
            for (const [sector, occupancy] of Object.entries(payload.crowdLevels)) {
                const aiResponse = await fetch(aiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sector_id: sector,
                        current_occupancy: occupancy === 'high' ? 600 : (occupancy === 'medium' ? 400 : 150),
                        flow_rate: Math.random() * 5
                    })
                });
                const aiData = await aiResponse.json();
                venueData.aiPredictions[sector] = aiData;
            }
        } catch (err) {
            console.error("AI Service Offline, skipping inference.", err.message);
        }

        // Broadcast to clients
        wss.clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(JSON.stringify({ type: 'VENUE_UPDATE', data: venueData }));
            }
        });
    }, 5000);

    ws.on('message', async (message) => {
        const msg = JSON.parse(message);
        if (msg.type === 'HARDWARE_UPDATE') { /* Optional external ingestion */ }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// Auth routes
app.use('/api/auth', authRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Node.js Gateway' }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Nexus Backend Gateway port ${PORT}`);
});
