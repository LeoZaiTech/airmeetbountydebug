import express from 'express';
import dotenv from 'dotenv';
import { WebhookHandler } from './handlers/webhooks';
import { AirmeetService } from './services/airmeet';
import { DevRevService } from './services/devrev';
import { DataMappingService } from './services/mapping';
import { NotificationService } from './services/notification';
import { NotificationConfig } from './types';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 8080;

// Initialize services
const airmeetService = new AirmeetService(process.env.AIRMEET_API_KEY || '');
const devrevService = new DevRevService(process.env.DEVREV_API_KEY || '');
const mappingService = new DataMappingService();

// Initialize notification config
const notificationConfig: NotificationConfig = {
  triggers: [
    {
      eventType: 'registration',
      conditions: {
        // Notify immediately for all registrations
        timeThreshold: 0
      }
    }
  ],
  templates: {
    'registration_notification': {
      id: 'registration_notification',
      title: 'New Event Registration',
      body: 'New registration for {{eventName}}:\n\n' +
            'Attendee: {{attendeeName}}\n' +
            'Email: {{attendeeEmail}}\n' +
            'Registration Time: {{registrationTime}}\n\n' +
            '{{#if company}}Company: {{company}}\n{{/if}}' +
            '{{#if utmSource}}Source: {{utmSource}}\n{{/if}}',
      priority: 'medium',
      variables: ['eventName', 'attendeeName', 'attendeeEmail', 'registrationTime', 'company', 'utmSource']
    }
  },
  accountOwnerMapping: {},
  enabled: true
};

const notificationService = new NotificationService(notificationConfig);

// Initialize webhook handler with all services
const webhookHandler = new WebhookHandler(
  airmeetService,
  devrevService,
  mappingService,
  notificationService
);

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

// Debug routes
app.get('/debug/status', (req, res) => {
  res.json({
    services: {
      airmeet: {
        status: 'connected',
        apiKey: process.env.AIRMEET_API_KEY ? 'configured' : 'missing'
      },
      devrev: {
        status: 'connected',
        apiKey: process.env.DEVREV_API_KEY ? 'configured' : 'missing'
      }
    },
    notifications: {
      enabled: notificationConfig.enabled,
      templates: Object.keys(notificationConfig.templates),
      triggers: notificationConfig.triggers
    }
  });
});

app.get('/debug/notifications/last', async (req, res) => {
  try {
    // This will be populated once we implement notification storage
    const lastNotifications = await notificationService.getLastNotifications(5);
    res.json({
      success: true,
      notifications: lastNotifications
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/debug/mappings', async (req, res) => {
  try {
    const sampleMapping = await mappingService.getLastMappedData(5);
    res.json({
      success: true,
      mappings: sampleMapping
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

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
  console.log('Debug endpoints:');
  console.log(`- Status: http://localhost:${port}/debug/status`);
  console.log(`- Last notifications: http://localhost:${port}/debug/notifications/last`);
  console.log(`- Last mappings: http://localhost:${port}/debug/mappings`);
  console.log('Environment:', {
    airmeetKeyConfigured: !!process.env.AIRMEET_API_KEY,
    devrevKeyConfigured: !!process.env.DEVREV_API_KEY
  });
});
