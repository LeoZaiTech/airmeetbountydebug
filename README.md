# Airmeet-DevRev Snap-in

A DevRev snap-in that syncs attendee data between Airmeet and DevRev platforms.

## Features

- Sync registration information
- Track session attendance and time spent
- Monitor event attendance and engagement
- Capture booth activity and lead magnet information
- Track registration UTM parameters
- Segment contacts based on event activities
- Automated notifications for specific activities
- Field mapping between DevRev and Airmeet

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with the following variables:
```
DEVREV_API_KEY=your_devrev_api_key
AIRMEET_API_KEY=your_airmeet_api_key
```

3. Build the project:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

## Development

- `npm run dev` - Run in development mode
- `npm test` - Run tests
- `npm run build` - Build for production

## Project Structure

- `/src` - Source code
  - `/handlers` - Event handlers and webhooks
  - `/services` - Business logic and API integrations
  - `/types` - TypeScript type definitions
  - `/utils` - Utility functions
- `/tests` - Test files
# AirMeetBounty
# airmeetbountydebug
# airmeetbountydebug
