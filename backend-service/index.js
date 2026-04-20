const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const http = require('http');

const app = express();
app.use(cors());
app.use(express.json());

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

    ws.on('message', async (message) => {
        const msg = JSON.parse(message);
        
        if (msg.type === 'HARDWARE_UPDATE') {
            venueData.queueTimes = msg.data.queueTimes;
            venueData.crowdLevels = msg.data.crowdLevels;
            
            // 🚀 Call Python AI Service for Predictions
            try {
                // Formatting payload for AI
                for (const [sector, occupancy] of Object.entries(msg.data.crowdLevels)) {
                    // Simulate calling Python API for each sector's telemetry
                    const aiResponse = await fetch('http://127.0.0.1:8000/predict_crowd', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sector_id: sector,
                            current_occupancy: occupancy === 'high' ? 600 : (occupancy === 'medium' ? 400 : 150),
                            flow_rate: Math.random() * 5 // simulated flow
                        })
                    });
                    const aiData = await aiResponse.json();
                    venueData.aiPredictions[sector] = aiData;
                }
            } catch (err) {
                console.error("AI Service Offline, skipping inference hook.", err.message);
            }

            // Broadcast ENRICHED data to all user clients
            wss.clients.forEach(client => {
                if (client.readyState === 1) { // WebSocket.OPEN
                    client.send(JSON.stringify({ type: 'VENUE_UPDATE', data: venueData }));
                }
            });
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Node.js Gateway' }));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Nexus Backend Gateway port ${PORT}`);
});
