const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('ws');
const http = require('http');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static('public'));

// Create an HTTP server and WebSocket server
const server = http.createServer(app);
const wss = new Server({ server });

// Temporary directory for file uploads
const TEMP_DIR = path.join(__dirname, 'temp');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Handle incoming messages
    ws.on('message', (message) => {
        // Parse the message
        const data = JSON.parse(message);

        if (data.type === 'file') {
            const { fileName, fileBuffer } = data;

            // Save the file
            const filePath = path.join(TEMP_DIR, fileName);
            fs.writeFile(filePath, Buffer.from(fileBuffer), (err) => {
                if (err) {
                    console.error('Error saving file:', err);
                    return;
                }
                console.log(`File ${fileName} received`);
            });
        }
    });

    // Handle WebSocket disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
