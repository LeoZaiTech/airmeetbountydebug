import { Request, Response } from 'express';
import { AirmeetService } from '../services/airmeet';
import { DevRevService } from '../services/devrev';
import { DataMappingService } from '../services/mapping';
import { NotificationService } from '../services/notification';
import { AirmeetRegistration, AirmeetSessionActivity, AirmeetBoothActivity } from '../types';

export class WebhookHandler {
  constructor(
    private airmeetService: AirmeetService,
    private devrevService: DevRevService,
    private mappingService: DataMappingService,
    private notificationService: NotificationService
  ) {}

  async handleRegistration(req: Request, res: Response) {
    console.log('Registration webhook received:', JSON.stringify(req.body, null, 2));
    try {
      // Map incoming payload to AirmeetRegistration format
      const registration: AirmeetRegistration = {
        id: req.body.id,
        event_id: req.body.eventId,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        email: req.body.email,
        registration_date: req.body.registrationTime,
        status: 'registered',
        utm_source: req.body.utmParameters?.source,
        utm_medium: req.body.utmParameters?.medium,
        utm_campaign: req.body.utmParameters?.campaign
      };

      console.log('Mapped registration data:', JSON.stringify(registration, null, 2));

      // Map the registration data to DevRev contact
      const mappedContact = this.mappingService.mapRegistrationToContact(registration);
      console.log('Mapped contact:', JSON.stringify(mappedContact, null, 2));

      // Create or update contact in DevRev
      const contact = await this.devrevService.createOrUpdateContact(mappedContact);
      console.log('Created/Updated contact in DevRev:', JSON.stringify(contact, null, 2));

      res.json({ success: true, contact });
    } catch (error) {
      console.error('Error handling registration webhook:', error);
      res.status(500).json({ error: 'Failed to process registration' });
    }
  }

  async handleSessionActivity(req: Request, res: Response) {
    console.log('Session activity webhook received:', req.body);
    try {
      const activity: AirmeetSessionActivity & { eventId: string } = req.body;
      console.log('Received session activity webhook:', activity);

      if (!activity.attendeeId || !activity.sessionId || !activity.eventId) {
        console.error('Missing required fields in request body');
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Find contact in DevRev
      const contact = await this.devrevService.findContactByEmail(activity.attendeeId);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found in DevRev' });
      }

      // Track session activity
      const devrevActivity = this.mappingService.mapSessionAttendance(activity, contact.id!);
      await this.devrevService.trackActivity(devrevActivity);

      // Add session attendee tag
      await this.devrevService.addTagsToContact(contact.id!, ['session-attendee']);

      // Send notification
      await this.notificationService.handleSessionActivity(activity, activity.eventId);

      res.status(200).json({ success: true, activity: devrevActivity });
    } catch (error: any) {
      console.error('Session activity webhook error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  async handleBoothActivity(req: Request, res: Response) {
    console.log('Booth activity webhook received:', req.body);
    try {
      const activity: AirmeetBoothActivity & { eventId: string } = req.body;
      console.log('Received booth activity webhook:', activity);

      if (!activity.attendeeId || !activity.boothId || !activity.eventId) {
        console.error('Missing required fields in request body');
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Find contact in DevRev
      const contact = await this.devrevService.findContactByEmail(activity.attendeeId);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found in DevRev' });
      }

      // Track booth activity
      const devrevActivity = this.mappingService.mapBoothVisit(activity, contact.id!);
      await this.devrevService.trackActivity(devrevActivity);

      // Add booth visitor tag
      await this.devrevService.addTagsToContact(contact.id!, ['booth-visitor']);

      // Send notification
      await this.notificationService.handleBoothActivity(activity, activity.eventId);

      res.status(200).json({ success: true, activity: devrevActivity });
    } catch (error: any) {
      console.error('Booth activity webhook error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}
