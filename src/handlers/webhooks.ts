import { Request, Response } from 'express';
import { AirmeetService } from '../services/airmeet';
import { DevRevService } from '../services/devrev';
import { DataMappingService } from '../services/mapping';

export class WebhookHandler {
  private mappingService: DataMappingService;

  constructor(
    private airmeetService: AirmeetService,
    private devrevService: DevRevService
  ) {
    this.mappingService = new DataMappingService();
  }

  async handleRegistration(req: Request, res: Response) {
    try {
      const { attendeeId } = req.body;
      console.log('Received registration webhook for attendeeId:', attendeeId);
      
      if (!attendeeId) {
        console.error('Missing attendeeId in request body');
        return res.status(400).json({ error: 'Missing attendeeId in request body' });
      }

      // Get registration data from Airmeet
      console.log('Fetching registration data from Airmeet API...');
      const registration = await this.airmeetService.getRegistration(attendeeId);
      console.log('Successfully retrieved registration data:', registration);

      // Map and create/update contact in DevRev
      const contact = this.mappingService.mapRegistrationToContact(registration);
      const devrevContact = await this.devrevService.createOrUpdateContact(contact);
      
      // Track registration activity
      const activity = this.mappingService.mapRegistrationActivity(registration);
      activity.contact_id = devrevContact.id!;
      await this.devrevService.trackActivity(activity);

      // Add appropriate tags
      const tags = this.mappingService.getActivityTags([activity]);
      await this.devrevService.addTagsToContact(devrevContact.id!, tags);
      
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
    try {
      const { attendeeId, sessionId, duration, joinTime } = req.body;
      console.log('Received session activity webhook:', { attendeeId, sessionId, duration, joinTime });

      if (!attendeeId || !sessionId) {
        console.error('Missing required fields in request body');
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Find contact in DevRev
      const contact = await this.devrevService.findContactByEmail(attendeeId);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found in DevRev' });
      }

      // Track session activity
      const activity = this.mappingService.mapSessionAttendance(
        contact.id!,
        sessionId,
        duration,
        joinTime
      );
      await this.devrevService.trackActivity(activity);

      // Add session attendee tag
      await this.devrevService.addTagsToContact(contact.id!, ['session-attendee']);

      res.status(200).json({ success: true, activity });
    } catch (error: any) {
      console.error('Session activity webhook error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  async handleBoothActivity(req: Request, res: Response) {
    try {
      const { attendeeId, boothId, duration, interactions } = req.body;
      console.log('Received booth activity webhook:', { attendeeId, boothId, duration });

      if (!attendeeId || !boothId) {
        console.error('Missing required fields in request body');
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      // Find contact in DevRev
      const contact = await this.devrevService.findContactByEmail(attendeeId);
      if (!contact) {
        return res.status(404).json({ error: 'Contact not found in DevRev' });
      }

      // Track booth activity
      const activity = this.mappingService.mapBoothVisit(
        contact.id!,
        boothId,
        duration,
        interactions || []
      );
      await this.devrevService.trackActivity(activity);

      // Add booth visitor tag
      await this.devrevService.addTagsToContact(contact.id!, ['booth-visitor']);

      res.status(200).json({ success: true, activity });
    } catch (error: any) {
      console.error('Booth activity webhook error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}
