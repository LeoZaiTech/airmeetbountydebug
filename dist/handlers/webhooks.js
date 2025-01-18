"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookHandler = void 0;
class WebhookHandler {
    constructor(airmeetService) {
        this.airmeetService = airmeetService;
    }
    async handleRegistration(req, res) {
        try {
            const { attendeeId } = req.body;
            console.log('Received registration webhook for attendeeId:', attendeeId);
            if (!attendeeId) {
                console.error('Missing attendeeId in request body');
                return res.status(400).json({ error: 'Missing attendeeId in request body' });
            }
            console.log('Fetching registration data from Airmeet API...');
            const registration = await this.airmeetService.getRegistration(attendeeId);
            console.log('Successfully retrieved registration data:', registration);
            // TODO: Process registration data and sync with DevRev
            res.status(200).json({ success: true, data: registration });
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
            const { attendeeId, sessionId, action } = req.body;
            console.log('Received session activity webhook:', { attendeeId, sessionId, action });
            if (!attendeeId || !sessionId || !action) {
                console.error('Missing required fields in request body');
                return res.status(400).json({ error: 'Missing required fields in request body' });
            }
            // TODO: Process session activity and sync with DevRev
            res.status(200).json({ success: true });
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
            const { attendeeId, boothId, action } = req.body;
            console.log('Received booth activity webhook:', { attendeeId, boothId, action });
            if (!attendeeId || !boothId || !action) {
                console.error('Missing required fields in request body');
                return res.status(400).json({ error: 'Missing required fields in request body' });
            }
            // TODO: Process booth activity and sync with DevRev
            res.status(200).json({ success: true });
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
