# Content Calendar with Google Sheets Backend

## Project Overview

Build a content calendar web app for the Fountain organic content team (TikTok, Instagram, YouTube). The app uses Google Sheets as the database backend — all data is stored in and synced from a shared Google Sheet.

**Stack:**
- Frontend: React + Vite
- Styling: Tailwind CSS (or inline styles as provided)
- Backend: Google Sheets API via Apps Script Web App
- No authentication required — internal tool with shared sheet access

---

## Features

### Core Calendar
- [x] Monthly view with drag-and-drop rescheduling
- [x] Week view for detailed planning
- [x] Filter by: assignee, platform, status, content pillar
- [x] Content cards showing: platform icon, assignee avatar, title, status, scheduled time

### Content Management
- [x] Add/edit/delete content items
- [x] Fields: title, platform, assignee, status, type, pillar, publish date, publish time, deadline
- [x] Caption/script editor with character counter
- [x] Hashtag suggestions by platform + pillar
- [x] Asset links (Canva, Drive, etc.)

### Workflow
- [x] Status progression: Draft → In Review → Approved → Scheduled → Published
- [x] Reviewer assignment
- [x] Approval workflow with sign-off tracking
- [x] Comments thread per content item
- [x] Deadline reminders toggle (for future Slack integration)
- [x] Overdue deadline warnings

### Templates
- [x] Recurring content templates (Transformation Tuesday, FAQ Friday, etc.)
- [x] One-click create from template

---

## Google Sheets Integration

### Sheet Structure

Create a Google Sheet named `Content Calendar` with two tabs:

**Tab 1: `Content`** (main data)
| Column | Field | Type | Notes |
|--------|-------|------|-------|
| A | id | number | Unique ID (timestamp) |
| B | title | string | Content title |
| C | platform | string | tiktok, instagram, youtube |
| D | assignee | number | Team member ID (1-4) |
| E | status | string | draft, review, approved, scheduled, published |
| F | type | string | Educational, Testimonial, Behind-the-scenes, Product, Trending, Q&A |
| G | pillar | string | weightloss, trt, hrt, lifestyle, testimonials |
| H | publishDate | string | YYYY-MM-DD |
| I | publishTime | string | HH:MM (24hr) |
| J | deadline | string | YYYY-MM-DD |
| K | caption | string | Full caption/script text |
| L | assetLinks | string | JSON array: [{"type":"canva","url":"...","label":"..."}] |
| M | comments | string | JSON array: [{"id":1,"author":1,"text":"...","timestamp":"..."}] |
| N | reviewer | number | Team member ID or empty |
| O | approvedBy | number | Team member ID or empty |
| P | approvedAt | string | ISO timestamp or empty |
| Q | reminderSet | boolean | TRUE/FALSE |

**Tab 2: `Team`** (reference data)
| Column | Field |
|--------|-------|
| A | id |
| B | name |
| C | avatar |
| D | color |
| E | role |

Sample team data:
```
1, Sarah, 👩‍🎨, #E8B4B8, Content Lead
2, Marcus, 👨‍💻, #A8D5BA, Video Editor
3, Jenna, 👩‍🎤, #B8C9E8, Social Manager
4, Tyler, 🧑‍🎬, #E8D4B8, Content Creator
```

---

## Apps Script Web App

Deploy this as a Web App (Execute as: Me, Access: Anyone with link):

```javascript
// See google-apps-script.js for full implementation

// Endpoints:
// GET ?action=getAll - Fetch all content
// GET ?action=getTeam - Fetch team members
// POST ?action=add - Add new content (body: JSON content object)
// POST ?action=update - Update content (body: JSON with id + fields)
// POST ?action=delete - Delete content (body: {id: number})
```

After deploying, you'll get a URL like:
`https://script.google.com/macros/s/ABC123.../exec`

---

## Frontend Implementation

### Environment Variables

Create `.env` file:
```
VITE_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### API Service

Create `src/services/sheetsApi.js`:
```javascript
const API_URL = import.meta.env.VITE_SHEETS_API_URL;

export const sheetsApi = {
  async getAll() {
    const res = await fetch(`${API_URL}?action=getAll`);
    return res.json();
  },
  
  async getTeam() {
    const res = await fetch(`${API_URL}?action=getTeam`);
    return res.json();
  },
  
  async add(content) {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'add', data: content }),
    });
    return res.json();
  },
  
  async update(content) {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'update', data: content }),
    });
    return res.json();
  },
  
  async delete(id) {
    const res = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'delete', id }),
    });
    return res.json();
  },
};
```

### State Management

Replace the local `useState` for contents with:
1. Fetch from Sheets on mount
2. Optimistic updates (update UI immediately, sync to sheet in background)
3. Error handling with retry logic

```javascript
// On mount
useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const [contentData, teamData] = await Promise.all([
        sheetsApi.getAll(),
        sheetsApi.getTeam(),
      ]);
      setContents(contentData);
      setTeamMembers(teamData);
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

// On add/edit
const handleAddContent = async () => {
  if (!newContent.title.trim()) return;
  
  const content = {
    ...newContent,
    id: editingContent?.id || Date.now(),
  };
  
  // Optimistic update
  if (editingContent) {
    setContents(contents.map(c => c.id === content.id ? content : c));
  } else {
    setContents([...contents, content]);
  }
  setShowModal(false);
  
  // Sync to sheet
  try {
    if (editingContent) {
      await sheetsApi.update(content);
    } else {
      await sheetsApi.add(content);
    }
  } catch (error) {
    // Revert on failure
    // Show error toast
  }
};
```

---

## File Structure

```
content-calendar/
├── .env
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── ContentCalendar.jsx      # Main calendar component
│   │   ├── CalendarDay.jsx          # Individual day cell
│   │   ├── ContentCard.jsx          # Content item card
│   │   ├── ContentModal.jsx         # Add/edit modal with tabs
│   │   ├── FilterBar.jsx            # Filter controls
│   │   ├── StatsBar.jsx             # Status counts
│   │   ├── TemplateModal.jsx        # Recurring templates
│   │   └── UserSelector.jsx         # "Who are you?" selector
│   ├── services/
│   │   └── sheetsApi.js             # Google Sheets API calls
│   ├── hooks/
│   │   └── useContentData.js        # Data fetching/caching hook
│   ├── constants/
│   │   ├── platforms.js             # Platform configs
│   │   ├── statuses.js              # Status configs
│   │   ├── pillars.js               # Content pillar configs
│   │   └── hashtags.js              # Hashtag sets by platform/pillar
│   └── styles/
│       └── index.css
└── google-apps-script/
    └── Code.gs                       # Apps Script backend
```

---

## Setup Instructions

### 1. Google Sheet Setup
1. Create new Google Sheet
2. Rename first tab to `Content`
3. Add headers in row 1: id, title, platform, assignee, status, type, pillar, publishDate, publishTime, deadline, caption, assetLinks, comments, reviewer, approvedBy, approvedAt, reminderSet
4. Create second tab named `Team`
5. Add team member data

### 2. Apps Script Setup
1. In Google Sheet: Extensions → Apps Script
2. Paste code from `google-apps-script.js`
3. Update `SHEET_ID` constant with your sheet ID (from URL)
4. Deploy → New deployment → Web app
5. Execute as: Me
6. Who has access: Anyone
7. Copy the deployment URL

### 3. Frontend Setup
1. Create Vite React project: `npm create vite@latest content-calendar -- --template react`
2. Copy component files
3. Add `.env` with your Apps Script URL
4. `npm install`
5. `npm run dev`

---

## Current User Handling

Since there's no auth, implement a simple user selector:

```javascript
const [currentUser, setCurrentUser] = useState(() => {
  return localStorage.getItem('contentCalendarUser') || null;
});

// If no user selected, show selector modal on first load
// Store selection in localStorage
// Use currentUser for:
//   - Default assignee on new content
//   - Author on comments
//   - "Approved by" on approvals
```

---

## Key Implementation Notes

1. **JSON Fields**: `assetLinks` and `comments` are stored as JSON strings in the sheet. Parse on read, stringify on write.

2. **Drag & Drop**: When dragging a card to a new date, only update `publishDate`. Keep all other fields intact.

3. **Optimistic Updates**: Update local state immediately for snappy UX, then sync to sheet. Revert if sync fails.

4. **Polling vs Webhooks**: For simplicity, poll the sheet every 60 seconds for updates from other users. Add a "Refresh" button for manual sync.

5. **Date Handling**: Store dates as `YYYY-MM-DD` strings. Parse carefully for calendar positioning.

6. **Error States**: Show loading spinner on initial load, error toast on sync failures, subtle "syncing..." indicator during saves.

---

## Component: ContentCalendar.jsx

The base component is provided in `content-calendar-v2.jsx`. Key modifications needed:

1. Replace hardcoded `contents` state with API fetch
2. Replace hardcoded `teamMembers` with API fetch
3. Add loading/error states
4. Add `currentUser` selector
5. Wire up all CRUD operations to `sheetsApi`
6. Add periodic refresh for multi-user sync

---

## Testing Checklist

- [ ] Content loads from sheet on page load
- [ ] Add new content → appears in sheet
- [ ] Edit content → updates in sheet
- [ ] Delete content → removes from sheet
- [ ] Drag to new date → updates publishDate in sheet
- [ ] Comments persist across refreshes
- [ ] Asset links persist across refreshes
- [ ] Filters work correctly
- [ ] Week view works correctly
- [ ] Templates create new content
- [ ] Multiple browser tabs stay in sync (via polling)
