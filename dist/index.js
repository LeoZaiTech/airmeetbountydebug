"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const webhooks_1 = require("./handlers/webhooks");
const airmeet_1 = require("./services/airmeet");
const devrev_1 = require("./services/devrev");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = process.env.PORT || 3000;
// Initialize services
const airmeetService = new airmeet_1.AirmeetService(process.env.AIRMEET_API_KEY || '');
const devrevService = new devrev_1.DevRevService(process.env.DEVREV_API_KEY || '');
// Initialize webhook handler with both services
const webhookHandler = new webhooks_1.WebhookHandler(airmeetService, devrevService);
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Airmeet-DevRev Snap-in API',
        version: '1.0.0',
        endpoints: {
            '/webhooks/registration': 'Handle registration events',
            '/webhooks/session': 'Handle session attendance events',
            '/webhooks/booth': 'Handle booth activity events'
        }
    });
});
// Webhook routes
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
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Environment:', {
        airmeetKeyConfigured: !!process.env.AIRMEET_API_KEY,
        devrevKeyConfigured: !!process.env.DEVREV_API_KEY
    });
});
