// Types for Airmeet events and data
export interface AirmeetRegistration {
  attendeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationTime: string;
  phone?: string;
  organization?: string;
  job_title?: string;
  utmParameters?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

export interface AirmeetSessionActivity {
  attendeeId: string;
  sessionId: string;
  joinTime: string;
  leaveTime: string;
  timeSpent: number;
}

export interface AirmeetBoothActivity {
  attendeeId: string;
  boothId: string;
  interactionType: string;
  timestamp: string;
  leadMagnetInfo?: {
    type: string;
    name: string;
    downloadTime?: string;
  };
}

// Types for DevRev integration
export interface DevRevContact {
  id?: string;
  display_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  custom_fields?: Record<string, any>;
}

export interface DevRevActivity {
  contact_id: string;
  activity_type: 'registration' | 'session_attendance' | 'booth_visit';
  metadata: Record<string, any>;
  timestamp: string;
}

// Notification System Types
export interface NotificationTrigger {
  eventType: 'registration' | 'session_join' | 'booth_visit' | 'lead_magnet_download' | 'question_asked';
  conditions?: {
    timeThreshold?: number; // in minutes
    boothTypes?: string[];
    sessionTypes?: string[];
    leadMagnetTypes?: string[];
  };
}

export interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high';
  variables: string[]; // List of variable names that can be replaced in the template
}

export interface NotificationConfig {
  triggers: NotificationTrigger[];
  templates: Record<string, NotificationTemplate>;
  accountOwnerMapping: Record<string, string>; // eventId -> accountOwnerId
  enabled: boolean;
}

export interface Notification {
  id: string;
  recipientId: string;
  templateId: string;
  variables: Record<string, string>;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  priority: 'low' | 'medium' | 'high';
  metadata: {
    eventType: string;
    contactId?: string;
    eventId?: string;
    sessionId?: string;
    boothId?: string;
  };
}

export interface SnapInConfig {
  devrevApiKey: string;
  airmeetApiKey: string;
  webhookSecret: string;
  fieldMappings: Record<string, string>;
  notificationConfig: NotificationConfig;
}
