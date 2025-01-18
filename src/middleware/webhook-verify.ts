import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
    console.log('Received webhook request with headers:', req.headers);
    const signature = req.headers['x-webhook-signature'] as string;
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('WEBHOOK_SECRET is not configured');
        return res.status(500).json({ error: 'Webhook verification is not properly configured' });
    }

    if (!signature) {
        console.error('No webhook signature provided');
        return res.status(401).json({ error: 'No webhook signature provided' });
    }

    try {
        // Get the raw body
        const rawBody = JSON.stringify(req.body);
        console.log('Raw body:', rawBody);
        
        // Create HMAC
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(rawBody);
        const calculatedSignature = hmac.digest('hex');
        
        console.log('Received signature:', signature);
        console.log('Calculated signature:', calculatedSignature);

        // Time-safe string comparison
        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature))) {
            console.error('Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid webhook signature' });
        }

        console.log('Webhook signature verified successfully');
        next();
    } catch (error) {
        console.error('Error verifying webhook signature:', error);
        return res.status(500).json({ error: 'Error verifying webhook signature' });
    }
}
