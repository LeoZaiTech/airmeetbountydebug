"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirmeetService = void 0;
const axios_1 = __importDefault(require("axios"));
class AirmeetService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.airmeet.com/v1';
    }
    async request(method, endpoint, data) {
        try {
            const response = await (0, axios_1.default)({
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                data,
            });
            return response.data;
        }
        catch (error) {
            console.error('Airmeet API error:', error);
            throw error;
        }
    }
    async getRegistration(attendeeId) {
        return this.request('GET', `/attendees/${attendeeId}`);
    }
    async getSessionActivity(attendeeId, sessionId) {
        return this.request('GET', `/sessions/${sessionId}/attendees/${attendeeId}`);
    }
    async getBoothActivity(attendeeId) {
        return this.request('GET', `/attendees/${attendeeId}/booth-activities`);
    }
}
exports.AirmeetService = AirmeetService;
