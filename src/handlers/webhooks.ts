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
    console.log('Registration webhook received:', req.body);
    try {
      const { id, eventId } = req.body;
      console.log('Received registration webhook for id:', id);
      
      if (!id || !eventId) {
        console.error('Missing required fields in request body');
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Get registration data from Airmeet
      const registration: AirmeetRegistration = await this.airmeetService.getRegistration(id);
      console.log('Successfully retrieved registration data:', registration);

      // Map and create/update contact in DevRev
      const contact = this.mappingService.mapRegistrationToContact(registration);
      const devrevContact = await this.devrevService.createOrUpdateContact(contact);
      
      // Track registration activity
      const activity = this.mappingService.mapRegistrationActivity(registration, devrevContact.id!);
      await this.devrevService.trackActivity(activity);

      // Add appropriate tags
      const tags = this.mappingService.getActivityTags([activity]);
      await this.devrevService.addTagsToContact(devrevContact.id!, tags);
      
      // Send notification
      await this.notificationService.handleRegistration(registration, eventId);

      res.status(200).json({ 
        success: true, 
        contact: devrevContact,
        activity: activity
      });
    } catch (error: any) {
      console.error('Registration webhook error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
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
