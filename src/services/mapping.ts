import { 
  AirmeetRegistration, 
  AirmeetSessionActivity, 
  AirmeetBoothActivity,
  DevRevContact,
  DevRevActivity
} from '../types';

export class DataMappingService {
  // Store last N mapped items for debugging
  private lastMappedItems: Array<{
    source: any;
    mapped: DevRevContact | DevRevActivity;
    timestamp: string;
    type: 'contact' | 'activity';
  }> = [];
  private readonly MAX_STORED_ITEMS = 100;

  private storeMappedItem(source: any, mapped: DevRevContact | DevRevActivity, type: 'contact' | 'activity') {
    console.log('Storing mapped item:', { source, mapped, type });
    this.lastMappedItems.unshift({
      source,
      mapped,
      timestamp: new Date().toISOString(),
      type
    });
    console.log('Current lastMappedItems:', this.lastMappedItems);
    if (this.lastMappedItems.length > this.MAX_STORED_ITEMS) {
      this.lastMappedItems.pop();
    }
  }

  async getLastMappedData(count: number = 5) {
    console.log('Getting last mapped data, count:', count);
    console.log('Current lastMappedItems:', this.lastMappedItems);
    return this.lastMappedItems.slice(0, count);
  }

  // Map Airmeet registration to DevRev contact
  mapRegistrationToContact(registration: AirmeetRegistration): DevRevContact {
    const contact: DevRevContact = {
      display_name: `${registration.first_name} ${registration.last_name}`,
      email: registration.email,
      custom_fields: {
        airmeet_id: registration.id,
        event_id: registration.event_id,
        registration_date: registration.registration_date,
        status: registration.status,
        utm_source: registration.utm_source,
        utm_medium: registration.utm_medium,
        utm_campaign: registration.utm_campaign,
      }
    };

    // Add optional fields if present
    if (registration.phone) {
      contact.phone = registration.phone;
    }
    if (registration.organization) {
      contact.organization = registration.organization;
    }
    if (registration.job_title) {
      contact.title = registration.job_title;
    }

    this.storeMappedItem(registration, contact, 'contact');
    return contact;
  }

  // Map registration activity
  mapRegistrationActivity(registration: AirmeetRegistration, contactId: string): DevRevActivity {
    const activity: DevRevActivity = {
      contact_id: contactId,
      activity_type: 'registration',
      metadata: {
        registration_id: registration.attendeeId,
        registration_time: registration.registrationTime,
        utm_parameters: registration.utmParameters
      },
      timestamp: new Date().toISOString()
    };

    this.storeMappedItem(registration, activity, 'activity');
    return activity;
  }

  // Map session attendance
  mapSessionAttendance(
    activity: AirmeetSessionActivity,
    contactId: string
  ): DevRevActivity {
    const mappedActivity: DevRevActivity = {
      contact_id: contactId,
      activity_type: 'session_attendance',
      metadata: {
        session_id: activity.sessionId,
        join_time: activity.joinTime,
        leave_time: activity.leaveTime,
        time_spent: activity.timeSpent
      },
      timestamp: new Date().toISOString()
    };

    this.storeMappedItem(activity, mappedActivity, 'activity');
    return mappedActivity;
  }

  // Map booth visit
  mapBoothVisit(
    activity: AirmeetBoothActivity,
    contactId: string
  ): DevRevActivity {
    const mappedActivity: DevRevActivity = {
      contact_id: contactId,
      activity_type: 'booth_visit',
      metadata: {
        booth_id: activity.boothId,
        interaction_type: activity.interactionType,
        lead_magnet_info: activity.leadMagnetInfo,
        timestamp: activity.timestamp
      },
      timestamp: new Date().toISOString()
    };

    this.storeMappedItem(activity, mappedActivity, 'activity');
    return mappedActivity;
  }

  // Get tags based on activities
  getActivityTags(activities: DevRevActivity[]): string[] {
    const tags: Set<string> = new Set();

    activities.forEach(activity => {
      switch (activity.activity_type) {
        case 'registration':
          tags.add('registered');
          break;
        case 'session_attendance':
          tags.add('session-attendee');
          break;
        case 'booth_visit':
          tags.add('booth-visitor');
          if (activity.metadata.lead_magnet_info) {
            tags.add('lead-magnet-downloaded');
          }
          break;
      }
    });

    return Array.from(tags);
  }
}
