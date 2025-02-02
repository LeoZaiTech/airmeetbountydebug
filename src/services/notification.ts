import { 
  NotificationConfig, 
  NotificationTemplate, 
  Notification,
  DevRevActivity,
  AirmeetRegistration,
  AirmeetSessionActivity,
  AirmeetBoothActivity
} from '../types';

export class NotificationService {
  private config: NotificationConfig;

  // Store last N notifications for debugging
  private lastNotifications: Notification[] = [];
  private readonly MAX_STORED_NOTIFICATIONS = 100;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  private async createNotification(
    templateId: string,
    recipientId: string,
    variables: Record<string, string>,
    metadata: Notification['metadata'],
    priority: NotificationTemplate['priority'] = 'medium'
  ): Promise<Notification> {
    const notification: Notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipientId,
      templateId,
      variables,
      status: 'pending',
      createdAt: new Date().toISOString(),
      priority,
      metadata
    };

    return notification;
  }

  private storeNotification(notification: Notification) {
    this.lastNotifications.unshift(notification);
    if (this.lastNotifications.length > this.MAX_STORED_NOTIFICATIONS) {
      this.lastNotifications.pop();
    }
  }

  async getLastNotifications(count: number = 5): Promise<Notification[]> {
    return this.lastNotifications.slice(0, count);
  }

  private async sendNotification(notification: Notification): Promise<void> {
    try {
      const template = this.config.templates[notification.templateId];
      if (!template) {
        throw new Error(`Template ${notification.templateId} not found`);
      }

      let message = template.body;
      
      // Replace variables in template
      Object.entries(notification.variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        message = message.replace(regex, value || '');
      });

      // Handle conditional blocks
      message = this.processConditionalBlocks(message, notification.variables);

      // Store notification for debugging
      this.storeNotification({
        ...notification,
        variables: {
          ...notification.variables,
          renderedMessage: message
        }
      });

      // TODO: Implement actual sending logic using DevRev API
      console.log(`[Notification] To: ${notification.recipientId}`);
      console.log(`[Notification] Title: ${template.title}`);
      console.log(`[Notification] Message:\n${message}`);

      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();
    } catch (error) {
      notification.status = 'failed';
      throw error;
    }
  }

  private processConditionalBlocks(message: string, variables: Record<string, string>): string {
    // Process {{#if variable}}content{{/if}} blocks
    const conditionalRegex = /{{#if\s+([^}]+)}}(.*?){{\/if}}/gs;
    return message.replace(conditionalRegex, (match, variable, content) => {
      return variables[variable] ? content : '';
    });
  }

  async handleRegistration(registration: AirmeetRegistration, eventId: string): Promise<void> {
    if (!this.config.enabled) return;

    const trigger = this.config.triggers.find(t => t.eventType === 'registration');
    if (!trigger) return;

    const accountOwnerId = this.config.accountOwnerMapping[eventId];
    if (!accountOwnerId) {
      console.warn(`No account owner found for event ${eventId}`);
      return;
    }

    const notification = await this.createNotification(
      'registration_notification',
      accountOwnerId,
      {
        attendeeName: `${registration.firstName} ${registration.lastName}`,
        attendeeEmail: registration.email,
        eventId: eventId,
        registrationTime: registration.registrationTime
      },
      {
        eventType: 'registration',
        contactId: registration.attendeeId,
        eventId
      },
      'high'
    );

    await this.sendNotification(notification);
  }

  async handleSessionActivity(activity: AirmeetSessionActivity, eventId: string): Promise<void> {
    if (!this.config.enabled) return;

    const trigger = this.config.triggers.find(t => t.eventType === 'session_join');
    if (!trigger) return;

    const accountOwnerId = this.config.accountOwnerMapping[eventId];
    if (!accountOwnerId) return;

    const notification = await this.createNotification(
      'session_join_notification',
      accountOwnerId,
      {
        attendeeId: activity.attendeeId,
        sessionId: activity.sessionId,
        joinTime: activity.joinTime,
        timeSpent: activity.timeSpent.toString()
      },
      {
        eventType: 'session_join',
        contactId: activity.attendeeId,
        eventId,
        sessionId: activity.sessionId
      }
    );

    await this.sendNotification(notification);
  }

  async handleBoothActivity(activity: AirmeetBoothActivity, eventId: string): Promise<void> {
    if (!this.config.enabled) return;

    const triggers = this.config.triggers.filter(t => 
      t.eventType === 'booth_visit' || 
      (t.eventType === 'lead_magnet_download' && activity.leadMagnetInfo)
    );

    if (triggers.length === 0) return;

    const accountOwnerId = this.config.accountOwnerMapping[eventId];
    if (!accountOwnerId) return;

    // Handle booth visit
    if (triggers.some(t => t.eventType === 'booth_visit')) {
      const notification = await this.createNotification(
        'booth_visit_notification',
        accountOwnerId,
        {
          attendeeId: activity.attendeeId,
          boothId: activity.boothId,
          interactionType: activity.interactionType,
          timestamp: activity.timestamp
        },
        {
          eventType: 'booth_visit',
          contactId: activity.attendeeId,
          eventId,
          boothId: activity.boothId
        }
      );

      await this.sendNotification(notification);
    }

    // Handle lead magnet download if applicable
    if (activity.leadMagnetInfo && triggers.some(t => t.eventType === 'lead_magnet_download')) {
      const notification = await this.createNotification(
        'lead_magnet_notification',
        accountOwnerId,
        {
          attendeeId: activity.attendeeId,
          boothId: activity.boothId,
          leadMagnetType: activity.leadMagnetInfo.type,
          leadMagnetName: activity.leadMagnetInfo.name,
          downloadTime: activity.leadMagnetInfo.downloadTime || activity.timestamp
        },
        {
          eventType: 'lead_magnet_download',
          contactId: activity.attendeeId,
          eventId,
          boothId: activity.boothId
        },
        'high'
      );

      await this.sendNotification(notification);
    }
  }
}
