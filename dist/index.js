"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const webhooks_1 = require("./handlers/webhooks");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Initialize webhook handler
const webhookHandler = new webhooks_1.WebhookHandler(process.env.AIRMEET_API_KEY || '');
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Airmeet-DevRev Snap-in API',
        version: '1.0.0',
        endpoints: {
            webhooks: {
                registration: '/webhooks/registration',
                session: '/webhooks/session',
                booth: '/webhooks/booth'
            },
            health: '/health'
        }
    });
});
// Routes
app.post('/webhooks/registration', (req, res) => webhookHandler.handleRegistration(req, res));
app.post('/webhooks/session', (req, res) => webhookHandler.handleSessionActivity(req, res));
app.post('/webhooks/booth', (req, res) => webhookHandler.handleBoothActivity(req, res));
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});
// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Visit http://localhost:${port} to see available endpoints`);
});
