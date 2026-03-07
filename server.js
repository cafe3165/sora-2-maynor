import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import Sora2 from './sora2.js';
import Sora2Winfull from "./sora2Winfull.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Sora2 client
const sora = new Sora2();
const soraWinfull = new Sora2Winfull();

// API Routes
app.post('/api/chat', async (req, res) => {
    try {
        const {messages, options} = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({error: 'Invalid messages format'});
        }

        const response = await sora.chat(messages, options);
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({error: error.message});
    }
});

// Streaming chat endpoint
app.post('/api/chat/stream', async (req, res) => {
    try {
        const {messages, options} = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({error: 'Invalid messages format'});
        }

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Forward the stream from Sora API
        await sora.chatStream(messages, options, (chunk) => {
            res.write(chunk);
        });

        res.end();
    } catch (error) {
        console.error('Chat stream error:', error);
        res.write(`data: ${JSON.stringify({error: error.message})}\n\n`);
        res.end();
    }
});

app.post('/api/completion', async (req, res) => {
    try {
        const {prompt, options} = req.body;

        if (!prompt) {
            return res.status(400).json({error: 'Prompt is required'});
        }

        const response = await sora.createCompletion(prompt, options);
        res.json(response);
    } catch (error) {
        console.error('Completion error:', error);
        res.status(500).json({error: error.message});
    }
});

// Video generation
app.post('/api/video/generate', async (req, res) => {
    try {
        const {prompt, options} = req.body;

        if (!prompt) {
            return res.status(400).json({error: 'Prompt is required'});
        }
        if (options.aiModel === "maynor1024") {
            const response = await sora.generateVideoV2(prompt, options);
            res.json(response);
        } else if (options.aiModel === "laozhangai") {
            const response = await sora.generateVideoV3(prompt, options);
            res.json(response);
        } else if (options.aiModel === "winfull") {
            const response = await soraWinfull.generateVideoWinfull(prompt, options);
            res.json(response);
        } else {
            const response = await sora.generateVideoV2(prompt, options);
            res.json(response);
        }


    } catch (error) {
        console.error('Video generation error:', error);
        res.status(500).json({error: error.message});
    }
});

// Get video task status
app.get('/api/video/tasks/:taskId', async (req, res) => {
    try {
        const {taskId} = req.params;
        const response = await sora.getVideoTask(taskId);
        res.json(response);
    } catch (error) {
        console.error('Task query error:', error);
        res.status(500).json({error: error.message});
    }
});

app.get('/api/video/tasks/winfull/:taskId', async (req, res) => {
    try {
        const {taskId} = req.params;
        const response = await soraWinfull.getVideoTaskWinfull(taskId);
        res.json(response);
    } catch (error) {
        console.error('Task query error:', error);
        res.status(500).json({error: error.message});
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({status: 'ok', timestamp: new Date().toISOString()});
});

// Root route - serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server (only for local development)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Sora-2 MVP Server running at http://localhost:${PORT}`);
        console.log(`📱 Open your browser to start chatting!`);
    });
}

// Export for Vercel
export default app;
