"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookHandler = void 0;
const airmeet_1 = require("../services/airmeet");
class WebhookHandler {
    constructor(airmeetApiKey) {
        this.airmeetService = new airmeet_1.AirmeetService(airmeetApiKey);
    }
    async handleRegistration(req, res) {
        try {
            const { attendeeId } = req.body;
            const registration = await this.airmeetService.getRegistration(attendeeId);
            // TODO: Process registration data and sync with DevRev
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Registration webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async handleSessionActivity(req, res) {
        try {
            const { attendeeId, sessionId } = req.body;
            const activity = await this.airmeetService.getSessionActivity(attendeeId, sessionId);
            // TODO: Process session activity and sync with DevRev
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Session activity webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async handleBoothActivity(req, res) {
        try {
            const { attendeeId } = req.body;
            const activities = await this.airmeetService.getBoothActivity(attendeeId);
            // TODO: Process booth activities and sync with DevRev
            res.status(200).json({ success: true });
        }
        catch (error) {
            console.error('Booth activity webhook error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.WebhookHandler = WebhookHandler;
