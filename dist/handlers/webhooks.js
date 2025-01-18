"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookHandler = void 0;
const mapping_1 = require("../services/mapping");
class WebhookHandler {
    constructor(airmeetService, devrevService) {
        this.airmeetService = airmeetService;
        this.devrevService = devrevService;
        this.mappingService = new mapping_1.DataMappingService();
    }
    async handleRegistration(req, res) {
        try {
            const { attendeeId } = req.body;
            console.log('Received registration webhook for attendeeId:', attendeeId);
            if (!attendeeId) {
                console.error('Missing attendeeId in request body');
                return res.status(400).json({ error: 'Missing attendeeId in request body' });
            }
            // Get registration data from Airmeet
            console.log('Fetching registration data from Airmeet API...');
            const registration = await this.airmeetService.getRegistration(attendeeId);
            console.log('Successfully retrieved registration data:', registration);
            // Map and create/update contact in DevRev
            const contact = this.mappingService.mapRegistrationToContact(registration);
            const devrevContact = await this.devrevService.createOrUpdateContact(contact);
            // Track registration activity
            const activity = this.mappingService.mapRegistrationActivity(registration, devrevContact.id);
            await this.devrevService.trackActivity(activity);
            // Add appropriate tags
            const tags = this.mappingService.getActivityTags([activity]);
            await this.devrevService.addTagsToContact(devrevContact.id, tags);
            res.status(200).json({
                success: true,
                contact: devrevContact,
                activity: activity
            });
        }
        catch (error) {
            console.error('Registration webhook error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
    async handleSessionActivity(req, res) {
        try {
            const activity = req.body;
            console.log('Received session activity webhook:', activity);
            if (!activity.attendeeId || !activity.sessionId) {
                console.error('Missing required fields in request body');
                return res.status(400).json({ error: 'Missing required fields in request body' });
            }
            // Find contact in DevRev
            const contact = await this.devrevService.findContactByEmail(activity.attendeeId);
            if (!contact) {
                return res.status(404).json({ error: 'Contact not found in DevRev' });
            }
            // Track session activity
            const devrevActivity = this.mappingService.mapSessionAttendance(activity, contact.id);
            await this.devrevService.trackActivity(devrevActivity);
            // Add session attendee tag
            await this.devrevService.addTagsToContact(contact.id, ['session-attendee']);
            res.status(200).json({ success: true, activity: devrevActivity });
        }
        catch (error) {
            console.error('Session activity webhook error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
    async handleBoothActivity(req, res) {
        try {
            const activity = req.body;
            console.log('Received booth activity webhook:', activity);
            if (!activity.attendeeId || !activity.boothId) {
                console.error('Missing required fields in request body');
                return res.status(400).json({ error: 'Missing required fields in request body' });
            }
            // Find contact in DevRev
            const contact = await this.devrevService.findContactByEmail(activity.attendeeId);
            if (!contact) {
                return res.status(404).json({ error: 'Contact not found in DevRev' });
            }
            // Track booth activity
            const devrevActivity = this.mappingService.mapBoothVisit(activity, contact.id);
            await this.devrevService.trackActivity(devrevActivity);
            // Add booth visitor tag
            await this.devrevService.addTagsToContact(contact.id, ['booth-visitor']);
            res.status(200).json({ success: true, activity: devrevActivity });
        }
        catch (error) {
            console.error('Booth activity webhook error:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error.message
            });
        }
    }
}
exports.WebhookHandler = WebhookHandler;
