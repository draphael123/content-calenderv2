# Content Calendar V2

A React-based content calendar application for managing social media content with Google Sheets as the backend.

## Features

- 📅 Monthly and Week calendar views
- 🎯 Drag-and-drop content scheduling
- 👥 Multi-user support with user selector
- 🔄 Real-time sync with Google Sheets (60s polling)
- ✨ Optimistic updates for snappy UX
- 📊 Status tracking and filtering
- 💬 Comments and approval workflow
- 📋 Recurring content templates

## Tech Stack

- **Frontend**: React + Vite
- **Styling**: Inline styles with CSS-in-JS
- **Backend**: Google Sheets API via Apps Script Web App

## Setup

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Rename first tab to `Content`
3. Add headers in row 1: `id, title, platform, assignee, status, type, pillar, publishDate, publishTime, deadline, caption, assetLinks, comments, reviewer, approvedBy, approvedAt, reminderSet`
4. Create second tab named `Team`
5. Add team member data with columns: `id, name, avatar, color, role`

### 2. Apps Script Setup

1. In Google Sheet: Extensions → Apps Script
2. Copy code from `google-apps-script.js`
3. Update `SHEET_ID` constant with your sheet ID (from URL)
4. Deploy → New deployment → Web app
5. Execute as: Me
6. Who has access: Anyone
7. Copy the deployment URL

### 3. Environment Variables

Create a `.env` file in the project root:

```
VITE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## Deployment

### Vercel

1. Push your code to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository: `draphael123/content-calenderv2`
4. Add environment variable:
   - Name: `VITE_SHEETS_API_URL`
   - Value: Your Google Apps Script deployment URL
5. Deploy!

The app will automatically deploy on every push to the `main` branch.

## Project Structure

```
content-calendar-v2/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Main app component
│   ├── components/
│   │   ├── ContentCalendar.jsx  # Main calendar component
│   │   └── UserSelector.jsx      # User selection modal
│   └── services/
│       └── sheetsApi.js      # Google Sheets API service
├── index.html
├── package.json
├── vite.config.js
├── vercel.json               # Vercel configuration
└── google-apps-script.js     # Apps Script backend code
```

## Usage

1. On first load, select your user profile
2. Content loads from Google Sheets
3. Click any day to add new content
4. Drag content cards to reschedule
5. Click content cards to edit
6. Use filters to find specific content
7. Templates create recurring content automatically

## License

Private project for Fountain organic content team.

