import { Request, Response } from 'express';
import { AirmeetService } from '../services/airmeet';
import { AirmeetRegistration, AirmeetSessionActivity, AirmeetBoothActivity } from '../types';

export class WebhookHandler {
  private airmeetService: AirmeetService;

  constructor(airmeetApiKey: string) {
    this.airmeetService = new AirmeetService(airmeetApiKey);
  }

  async handleRegistration(req: Request, res: Response) {
    try {
      const { attendeeId } = req.body;
      const registration = await this.airmeetService.getRegistration(attendeeId);
      
      // TODO: Process registration data and sync with DevRev
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Registration webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handleSessionActivity(req: Request, res: Response) {
    try {
      const { attendeeId, sessionId } = req.body;
      const activity = await this.airmeetService.getSessionActivity(attendeeId, sessionId);
      
      // TODO: Process session activity and sync with DevRev
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Session activity webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handleBoothActivity(req: Request, res: Response) {
    try {
      const { attendeeId } = req.body;
      const activities = await this.airmeetService.getBoothActivity(attendeeId);
      
      // TODO: Process booth activities and sync with DevRev
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Booth activity webhook error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
