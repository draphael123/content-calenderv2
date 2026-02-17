# Content Calendar Spreadsheet Format Guide

This document describes the exact spreadsheet format used by the Content Calendar website.

## 📋 Sheet 1: Content

This is the main content tracking sheet. Each row represents one piece of content.

### Column Structure

| Column Name | Type | Example | Description |
|------------|------|---------|-------------|
| **id** | Number | 1 | Unique identifier for each content piece |
| **title** | Text | "GLP-1 Weight Loss Tips" | Content title/headline |
| **platform** | Text | tiktok | Platform: `tiktok`, `instagram`, or `youtube` |
| **assignee** | Number | 1 | Team member ID (from Team sheet) |
| **status** | Text | draft | Status: `draft`, `review`, `approved`, `scheduled`, or `published` |
| **type** | Text | Educational | Content type (see Content Types below) |
| **pillar** | Text | weightloss | Content pillar (see Content Pillars below) |
| **publishDate** | Date | 2025-02-15 | Publish date in YYYY-MM-DD format |
| **publishTime** | Time | 10:00 | Publish time in HH:MM format (24-hour) |
| **deadline** | Date | 2025-02-13 | Creation deadline in YYYY-MM-DD format |
| **caption** | Text | "5 tips for success! #glp1" | Post caption/script text |
| **assetLinks** | JSON Array | See below | Links to design files, videos, etc. |
| **comments** | JSON Array | See below | Team comments and discussion |
| **reviewer** | Number | 3 | Team member ID assigned to review (or empty) |
| **approvedBy** | Number | 3 | Team member ID who approved (or empty) |
| **approvedAt** | DateTime | 2025-02-14T09:00:00 | Approval timestamp in ISO format (or empty) |
| **reminderSet** | Boolean | true | Whether deadline reminder is set: `true` or `false` |

### Valid Values Reference

#### Platforms
- `tiktok` - TikTok (♪)
- `instagram` - Instagram (◎)
- `youtube` - YouTube (▶)

#### Statuses
- `draft` - Draft (initial creation)
- `review` - In Review (awaiting approval)
- `approved` - Approved (ready to publish)
- `scheduled` - Scheduled (queued for publishing)
- `published` - Published (live on platform)

#### Content Types
- `Educational` - 📚 Educational content
- `Testimonial` - 💬 Patient testimonials
- `Q&A` - ❓ Question & Answer
- `Behind-the-scenes` - 🎬 BTS content
- `Product` - 📦 Product features
- `Trending` - 📈 Trending topics
- `Promotional` - 📢 Promotional content
- `Announcement` - 📣 Announcements

#### Content Pillars
- `weightloss` - ⚖️ Weight Loss / GLP-1
- `trt` - 💪 TRT (Testosterone Replacement Therapy)
- `hrt` - ✨ HRT (Hormone Replacement Therapy)
- `lifestyle` - 🌿 Lifestyle & Wellness
- `testimonials` - 💬 Patient Stories

### Asset Links Format (JSON)

The `assetLinks` column should contain a JSON array of objects:

```json
[
  {
    "type": "canva",
    "url": "https://canva.com/design/abc123",
    "label": "Video Edit"
  },
  {
    "type": "drive",
    "url": "https://drive.google.com/file/xyz",
    "label": "Raw Footage"
  }
]
```

**Asset Types:**
- `canva` - Canva designs
- `drive` - Google Drive files
- `other` - Other links

**Note:** Use empty brackets `[]` if no assets.

### Comments Format (JSON)

The `comments` column should contain a JSON array of objects:

```json
[
  {
    "id": 1,
    "author": 3,
    "text": "Great hook! Maybe add a CTA at the end?",
    "timestamp": "2025-02-10T10:30:00"
  },
  {
    "id": 2,
    "author": 1,
    "text": "Good call, added 'Link in bio'",
    "timestamp": "2025-02-10T14:15:00"
  }
]
```

**Note:** Use empty brackets `[]` if no comments.

---

## 👥 Sheet 2: Team

This sheet contains team member information.

### Column Structure

| Column Name | Type | Example | Description |
|------------|------|---------|-------------|
| **id** | Number | 1 | Unique team member ID |
| **name** | Text | Momsh D | Team member's name |
| **avatar** | Emoji | 👩‍🎨 | Emoji avatar for visual identification |
| **color** | Hex Color | #E8B4B8 | Background color for avatar display |
| **role** | Text | Content Lead | Team member's role/title |

### Example Team Data

| id | name | avatar | color | role |
|----|------|--------|-------|------|
| 1 | Momsh D | 👩‍🎨 | #E8B4B8 | Content Lead |
| 2 | Momsh V | 👨‍💻 | #A8D5BA | Video Editor |
| 3 | Momsh A | 👩‍🎤 | #B8C9E8 | Social Manager |
| 4 | Momsh P | 🧑‍🎬 | #E8D4B8 | Content Creator |
| 5 | Momsh R | 👨‍🎨 | #D4B8E8 | Content Creator |

---

## 📝 Sample Content Row (Complete Example)

Here's a complete example row showing all fields filled out:

```csv
1,"GLP-1 Weight Loss Journey Tips",tiktok,1,approved,Educational,weightloss,2025-02-15,10:00,2025-02-13,"Here are 5 tips to maximize your GLP-1 results 💪 #glp1 #weightloss","[{""type"":""canva"",""url"":""https://canva.com/design/abc123"",""label"":""Video Edit""}]","[{""id"":1,""author"":3,""text"":""Love the hook!"",""timestamp"":""2025-01-28T10:30:00""},{""id"":2,""author"":1,""text"":""Thanks!"",""timestamp"":""2025-01-28T14:15:00""}]",3,3,2025-01-30T09:00:00,true
```

---

## 🎯 Quick Reference: Typical Workflow

1. **Draft Created** → status: `draft`, assignee: creator ID
2. **Ready for Review** → status: `review`, reviewer: manager ID
3. **Approved** → status: `approved`, approvedBy: manager ID, approvedAt: timestamp
4. **Scheduled** → status: `scheduled`, publishDate & publishTime set
5. **Published** → status: `published`

---

## 📊 Tips for Maintaining Your Spreadsheet

### Date Formats
- **Dates:** Always use `YYYY-MM-DD` format (e.g., `2025-02-15`)
- **Times:** Always use `HH:MM` 24-hour format (e.g., `14:30` for 2:30 PM)
- **Timestamps:** Use ISO format `YYYY-MM-DDTHH:MM:SS` (e.g., `2025-02-15T14:30:00`)

### JSON Fields
- For `assetLinks` and `comments`, use proper JSON formatting
- In CSV, wrap JSON in double quotes and escape inner quotes with `""`
- Empty arrays should be `[]` not blank

### Required Fields
- **Always required:** id, title, platform, assignee, status, type, pillar, publishDate
- **Optional but recommended:** publishTime, deadline, caption
- **Optional:** assetLinks, comments, reviewer, approvedBy, approvedAt, reminderSet

### Common Mistakes to Avoid
❌ Wrong date format: `02/15/2025` (use `2025-02-15`)
❌ Wrong time format: `2:30 PM` (use `14:30`)
❌ Invalid status: `pending` (use `draft`, `review`, etc.)
❌ Invalid platform: `facebook` (use `tiktok`, `instagram`, or `youtube`)
❌ Blank JSON fields (use `[]` instead)

---

## 🔗 Integration with Website

The website automatically:
- ✅ Syncs with Google Sheets every 60 seconds
- ✅ Shows content on the calendar by `publishDate`
- ✅ Color-codes by platform and status
- ✅ Enables drag-and-drop to reschedule (updates `publishDate`)
- ✅ Filters by assignee, platform, status, pillar, and type
- ✅ Displays comments and approval workflow
- ✅ Suggests hashtags based on platform + pillar combination

---

## 📥 Import Instructions

### For Google Sheets:
1. Create a new Google Sheet
2. Name the first tab `Content`
3. Name the second tab `Team`
4. Import the CSV data or manually create headers
5. Ensure column names match exactly (case-sensitive)

### For Excel:
1. Open Excel
2. Import CSV as a table
3. Format date columns as Date/Time appropriately
4. Save as .xlsx if needed

---

**Need Help?** Contact your team lead or refer to the README.md for full setup instructions.

