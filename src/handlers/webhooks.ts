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
      console.log('Received registration webhook for attendeeId:', attendeeId);
      
      if (!attendeeId) {
        console.error('Missing attendeeId in request body');
        return res.status(400).json({ error: 'Missing attendeeId in request body' });
      }

      console.log('Fetching registration data from Airmeet API...');
      const registration = await this.airmeetService.getRegistration(attendeeId);
      console.log('Successfully retrieved registration data:', registration);
      
      // TODO: Process registration data and sync with DevRev
      
      res.status(200).json({ success: true, data: registration });
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
