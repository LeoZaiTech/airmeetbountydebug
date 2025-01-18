const crypto = require('crypto');

const webhookSecret = '05d01848ef71fa23c37462b1b9d5e1f1e70018dfa9279a5d12c46ce0bb38c14b';
const payload = {
    "id": "test123",
    "eventId": "event123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "registrationTime": "2025-01-18T18:00:00Z",
    "utmParameters": {
        "source": "linkedin",
        "medium": "social"
    }
};

const rawBody = JSON.stringify(payload);
const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

console.log('Generated signature:', signature);
console.log('\nTest with this curl command:\n');
console.log(`curl -X POST http://localhost:3000/webhooks/registration \\
    -H "Content-Type: application/json" \\
    -H "x-webhook-signature: ${signature}" \\
    -d '${rawBody}'`);
