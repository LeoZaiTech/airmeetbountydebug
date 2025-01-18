import axios, { AxiosInstance } from 'axios';
import { DevRevContact, DevRevActivity, DevRevContactFilter } from '../types/devrev';

export class DevRevService {
  private client: AxiosInstance;
  private baseUrl: string = 'https://api.devrev.ai/v1';

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => {
        console.error('DevRev API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }
    );
  }

  async createOrUpdateContact(contact: DevRevContact): Promise<DevRevContact> {
    try {
      // First try to find if contact exists by email
      const existingContact = await this.findContactByEmail(contact.email);
      
      if (existingContact) {
        // Update existing contact
        const response = await this.client.patch(
          `/contacts/${existingContact.id}`,
          contact
        );
        return response.data;
      } else {
        // Create new contact
        const response = await this.client.post('/contacts', contact);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating/updating contact:', error);
      throw error;
    }
  }

  async findContactByEmail(email: string): Promise<DevRevContact | null> {
    try {
      const response = await this.client.get(`/contacts`, {
        params: {
          email: email
        }
      });
      return response.data.contacts[0] || null;
    } catch (error) {
      console.error('Error finding contact:', error);
      throw error;
    }
  }

  async trackActivity(activity: DevRevActivity): Promise<void> {
    try {
      await this.client.post(`/contacts/${activity.contact_id}/activities`, {
        type: activity.activity_type,
        metadata: activity.metadata,
        timestamp: activity.timestamp
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }

  async addTagsToContact(contactId: string, tags: string[]): Promise<void> {
    try {
      await this.client.post(`/contacts/${contactId}/tags`, {
        tags: tags
      });
    } catch (error) {
      console.error('Error adding tags:', error);
      throw error;
    }
  }

  async filterContacts(filter: DevRevContactFilter): Promise<DevRevContact[]> {
    try {
      const response = await this.client.post('/contacts/filter', filter);
      return response.data.contacts;
    } catch (error) {
      console.error('Error filtering contacts:', error);
      throw error;
    }
  }

  async createCustomField(name: string, fieldType: string): Promise<void> {
    try {
      await this.client.post('/custom-fields', {
        name,
        type: fieldType
      });
    } catch (error) {
      console.error('Error creating custom field:', error);
      throw error;
    }
  }
}
