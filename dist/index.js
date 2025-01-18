"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const webhooks_1 = require("./handlers/webhooks");
const airmeet_1 = require("./services/airmeet");
const webhookVerification_1 = require("./middleware/webhookVerification");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
// Initialize services and handlers
const airmeetService = new airmeet_1.AirmeetService();
const webhookHandler = new webhooks_1.WebhookHandler(airmeetService);
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
// Webhook routes with verification middleware
app.post('/webhooks/registration', webhookVerification_1.verifyWebhook, webhookHandler.handleRegistration.bind(webhookHandler));
app.post('/webhooks/session', webhookVerification_1.verifyWebhook, webhookHandler.handleSessionActivity.bind(webhookHandler));
app.post('/webhooks/booth', webhookVerification_1.verifyWebhook, webhookHandler.handleBoothActivity.bind(webhookHandler));
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
