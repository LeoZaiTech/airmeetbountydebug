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
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  customFields?: Record<string, any>;
}

export interface SnapInConfig {
  devrevApiKey: string;
  airmeetApiKey: string;
  webhookSecret: string;
  fieldMappings: Record<string, string>;
}
