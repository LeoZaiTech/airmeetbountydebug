// Types for Airmeet events and data
export interface AirmeetRegistration {
  attendeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  registrationTime: string;
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

export interface SnapInConfig {
  devrevApiKey: string;
  airmeetApiKey: string;
  webhookSecret: string;
  fieldMappings: Record<string, string>;
}
