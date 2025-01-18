export interface AirmeetRegistration {
    id: string;
    event_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    organization?: string;
    job_title?: string;
    registration_date: string;
    status: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    custom_fields?: Record<string, any>;
}

export interface AirmeetSessionActivity {
    attendee_id: string;
    session_id: string;
    join_time: string;
    leave_time?: string;
    duration?: number;
    interactions?: {
        type: string;
        timestamp: string;
        data?: any;
    }[];
}

export interface AirmeetBoothActivity {
    attendee_id: string;
    booth_id: string;
    visit_time: string;
    duration: number;
    interactions: {
        type: string;
        timestamp: string;
        data?: any;
    }[];
}

export interface AirmeetAttendee {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    organization?: string;
    designation?: string;
    profile_image?: string;
    social_links?: {
        type: string;
        url: string;
    }[];
}
