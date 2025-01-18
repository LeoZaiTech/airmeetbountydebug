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
  activity_type: 'registration' | 'session_attendance' | 'booth_visit' | 'question_asked';
  metadata: Record<string, any>;
  timestamp: string;
}

export interface DevRevTag {
  name: string;
  value?: string;
}

export interface DevRevContactFilter {
  tags?: DevRevTag[];
  custom_fields?: Record<string, any>;
}
