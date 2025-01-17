import axios from 'axios';
import { AirmeetRegistration, AirmeetSessionActivity, AirmeetBoothActivity } from '../types';

export class AirmeetService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.airmeet.com/v1';
  }

  private async request<T>(method: string, endpoint: string, data?: any): Promise<T> {
    try {
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data,
      });
      return response.data;
    } catch (error) {
      console.error('Airmeet API error:', error);
      throw error;
    }
  }

  async getRegistration(attendeeId: string): Promise<AirmeetRegistration> {
    return this.request<AirmeetRegistration>('GET', `/attendees/${attendeeId}`);
  }

  async getSessionActivity(attendeeId: string, sessionId: string): Promise<AirmeetSessionActivity> {
    return this.request<AirmeetSessionActivity>('GET', `/sessions/${sessionId}/attendees/${attendeeId}`);
  }

  async getBoothActivity(attendeeId: string): Promise<AirmeetBoothActivity[]> {
    return this.request<AirmeetBoothActivity[]>('GET', `/attendees/${attendeeId}/booth-activities`);
  }
}
