import { DevRevContact, DevRevActivity } from '../types/devrev';
import { AirmeetRegistration } from '../types/airmeet';

export class DataMappingService {
  // Map Airmeet registration to DevRev contact
  mapRegistrationToContact(registration: AirmeetRegistration): DevRevContact {
    return {
      display_name: `${registration.first_name} ${registration.last_name}`,
      email: registration.email,
      phone: registration.phone,
      company: registration.organization,
      title: registration.job_title,
      custom_fields: {
        airmeet_registration_id: registration.id,
        registration_date: registration.registration_date,
        utm_source: registration.utm_source,
        utm_medium: registration.utm_medium,
        utm_campaign: registration.utm_campaign
      }
    };
  }

  // Map registration activity
  mapRegistrationActivity(registration: AirmeetRegistration): DevRevActivity {
    return {
      contact_id: registration.id, // This will be updated with actual DevRev contact ID
      activity_type: 'registration',
      metadata: {
        event_id: registration.event_id,
        registration_date: registration.registration_date,
        registration_status: registration.status
      },
      timestamp: new Date().toISOString()
    };
  }

  // Map session attendance
  mapSessionAttendance(
    contactId: string,
    sessionId: string,
    duration: number,
    joinTime: string
  ): DevRevActivity {
    return {
      contact_id: contactId,
      activity_type: 'session_attendance',
      metadata: {
        session_id: sessionId,
        duration_minutes: duration,
        join_time: joinTime
      },
      timestamp: new Date().toISOString()
    };
  }

  // Map booth visit
  mapBoothVisit(
    contactId: string,
    boothId: string,
    duration: number,
    interactions: any[]
  ): DevRevActivity {
    return {
      contact_id: contactId,
      activity_type: 'booth_visit',
      metadata: {
        booth_id: boothId,
        duration_minutes: duration,
        interactions: interactions
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
          break;
        case 'question_asked':
          tags.add('engaged');
          break;
      }
    });

    return Array.from(tags);
  }
}
