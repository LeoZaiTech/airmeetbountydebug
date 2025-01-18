import express from 'express';
import dotenv from 'dotenv';
import { WebhookHandler } from './handlers/webhooks';
import { AirmeetService } from './services/airmeet';
import { DevRevService } from './services/devrev';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Initialize services
const airmeetService = new AirmeetService(process.env.AIRMEET_API_KEY || '');
const devrevService = new DevRevService(process.env.DEVREV_API_KEY || '');

// Initialize webhook handler with both services
const webhookHandler = new WebhookHandler(airmeetService, devrevService);

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
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
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
