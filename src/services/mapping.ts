import { 
  AirmeetRegistration, 
  AirmeetSessionActivity, 
  AirmeetBoothActivity,
  DevRevContact,
  DevRevActivity
} from '../types';

export class DataMappingService {
  // Map Airmeet registration to DevRev contact
  mapRegistrationToContact(registration: AirmeetRegistration): DevRevContact {
    return {
      id: undefined, // Will be set by DevRev
      display_name: `${registration.firstName} ${registration.lastName}`,
      email: registration.email,
      custom_fields: {
        airmeet_registration_id: registration.attendeeId,
        registration_time: registration.registrationTime,
        utm_source: registration.utmParameters?.source,
        utm_medium: registration.utmParameters?.medium,
        utm_campaign: registration.utmParameters?.campaign
      }
    };
  }

  // Map registration activity
  mapRegistrationActivity(registration: AirmeetRegistration, contactId: string): DevRevActivity {
    return {
      contact_id: contactId,
      activity_type: 'registration',
      metadata: {
        registration_id: registration.attendeeId,
        registration_time: registration.registrationTime,
        utm_parameters: registration.utmParameters
      },
      timestamp: new Date().toISOString()
    };
  }

  // Map session attendance
  mapSessionAttendance(
    activity: AirmeetSessionActivity,
    contactId: string
  ): DevRevActivity {
    return {
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
  }

  // Map booth visit
  mapBoothVisit(
    activity: AirmeetBoothActivity,
    contactId: string
  ): DevRevActivity {
    return {
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
