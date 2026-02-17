# 📅 How the Content Calendar Works - Complete Guide

This guide explains all the features, views, and options available in the Content Calendar website.

---

## 🎯 Overview

The Content Calendar is a visual planning tool that syncs with Google Sheets in real-time. It displays your social media content on a calendar grid, allowing you to plan, schedule, assign, review, and track content across TikTok, Instagram, and YouTube.

### Key Features at a Glance
- 📅 **Visual Calendar** - Month and Week views
- 🖱️ **Drag & Drop** - Reschedule content by dragging
- 👥 **Multi-User** - User selector with profile tracking
- 🔄 **Real-Time Sync** - Auto-syncs with Google Sheets every 60 seconds
- ⚡ **Optimistic Updates** - Instant UI updates (syncs in background)
- 🔍 **Advanced Filters** - Filter by team, platform, status, pillar, type
- 💬 **Collaboration** - Comments and approval workflow
- 📋 **Templates** - Quick-create recurring content
- #️⃣ **Smart Hashtags** - Auto-suggested hashtags by platform + pillar

---

## 🚀 Getting Started

### 1. User Selection
When you first open the calendar, you'll see a **User Selector** screen:

```
┌────────────────────────────────┐
│   Select Your Profile          │
│                                │
│   👩‍🎨 Momsh D - Content Lead    │
│   👨‍💻 Momsh V - Video Editor     │
│   👩‍🎤 Momsh A - Social Manager   │
│   🧑‍🎬 Momsh P - Content Creator  │
│   👨‍🎨 Momsh R - Content Creator  │
└────────────────────────────────┘
```

**What This Does:**
- Sets your default user for creating content
- Saves your selection to browser (persists between sessions)
- Changes the "Assign To" default when creating new content

**How to Change User:**
- Currently, refresh the page and clear localStorage
- Your selection determines which avatar appears on content you create

---

## 📊 Main Calendar Interface

### Header Section
Located at the top, contains:

#### Left Side:
- **Title:** "Content Calendar"
- **Subtitle:** Shows team name and sync status
  - "🔄 Syncing..." appears when saving to Google Sheets

#### Right Side:
- **📋 Templates Button** - Opens recurring content templates
- **📥 Download Button** - Export calendar data as CSV files
- **💡 Suggestions Button** - Opens feedback/suggestion form
- **❓ How It Works Button** - Opens interactive help guide
- **🌙/☀️ Dark Mode Toggle** - Switch between light and dark themes
- **View Toggle** - Switch between Month/Week view
  ```
  [Month] [Week]
  ```

### 🔍 Search Bar
Located below the header:
- Search across all content fields
- Finds matches in title, caption, platform, type, and pillar
- Real-time filtering as you type
- Clear button to reset search
- Works alongside other filters

**How to Use:**
1. Type in the search box
2. Results filter instantly
3. Click "Clear Search" to reset

**Examples:**
- Search "TikTok" → Shows all TikTok content
- Search "weight loss" → Shows weight loss pillar content
- Search "testimonial" → Shows all testimonial types

### Stats Dashboard
Displays content count by status with color-coded indicators:

```
┌──────────┬──────────────┬────────────┬─────────────┬─────────────┐
│ Draft    │ In Review    │ Approved   │ Scheduled   │ Published   │
│ ● 3      │ ● 1          │ ● 2        │ ● 1         │ ● 4         │
└──────────┴──────────────┴────────────┴─────────────┴─────────────┘
```

**Updates Automatically:**
- Reflects current filters
- Shows count for each status
- Color-coded for quick scanning

---

## 🔍 Filters & Search

### Filter Bar
Located below the header, allows you to narrow down content:

**5 Filter Options:**

1. **👥 All Team / Specific Member**
   - Filter by assignee
   - Shows only content assigned to selected person

2. **📱 All Platforms / TikTok / Instagram / YouTube**
   - Filter by social platform
   - Each has unique icon (♪ ◎ ▶)

3. **📝 All Types**
   - Educational 📚
   - Testimonial 💬
   - Q&A ❓
   - Behind-the-scenes 🎬
   - Product 📦
   - Trending 📈
   - Promotional 📢
   - Announcement 📣

4. **📊 All Status / Draft / Review / Approved / Scheduled / Published**
   - Filter by content status
   - Tracks workflow progression

5. **🎯 All Pillars**
   - Weight Loss / GLP-1 ⚖️
   - TRT 💪
   - HRT ✨
   - Lifestyle & Wellness 🌿
   - Patient Stories 💬

**Clear Button:**
- Appears when any filter is active
- Click to reset all filters to "All"

**How Filters Work:**
- Multiple filters combine (AND logic)
- Calendar updates instantly
- Stats bar reflects filtered content
- Filters persist during session

---

## 📅 Calendar Views

### Month View (Default)

```
┌─────────────────────────────────────────────────────────────────┐
│                      ← February 2025 →                           │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  1  │  2  │  3  │  4  │  5  │  6  │  7  │
│     │     │ [📱]│     │ [📱]│ [📱]│     │
│     │     │     │     │ [📱]│     │     │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┤
│  8  │  9  │ 10  │ ... │     │     │     │
```

**Features:**
- Shows up to 3 content cards per day
- "+X more" indicator if more than 3 items
- Click any day to add new content
- Navigate months: ← Previous / Next → buttons

**When to Use:**
- Planning content across multiple weeks
- Getting overview of the month
- Spotting gaps in schedule
- Long-term planning

---

### Week View

```
┌─────────────────────────────────────────────────────────────────┐
│                   ← Week of Feb 2 →                              │
├─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────┤
│   SUN   │   MON   │   TUE   │   WED   │   THU   │   FRI   │ SAT │
│    2    │    3    │    4    │    5    │    6    │    7    │  8  │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────┤
│ [📱]    │         │ [📱]    │         │ [📱]    │ [📱]    │     │
│         │         │         │         │ [📱]    │         │     │
│         │         │         │         │ [📱]    │         │     │
│         │         │         │         │         │         │     │
│         │         │         │         │         │         │     │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────┘
```

**Features:**
- Taller columns (shows ALL content for each day)
- No "+X more" limit
- Today's date highlighted with accent border
- Navigate weeks: ← Prev Week / Next Week → buttons

**When to Use:**
- Detailed view of current/specific week
- Managing dense schedules
- Seeing all content at once
- Day-by-day planning

---

## 🎴 Content Cards

Each content piece appears as a card on the calendar:

### Card Anatomy
```
┌─────────────────────────────┐
│ ♪ ⚖️               👩‍🎨      │  ← Icons & Avatar
├─────────────────────────────┤
│ GLP-1 Weight Loss Tips      │  ← Title (2 lines max)
├─────────────────────────────┤
│ [Approved] 🕐 10:00 AM      │  ← Status & Time
│ 💬 2  🔔  ⚠ Overdue        │  ← Indicators
└─────────────────────────────┘
```

### Card Elements:

**Top Row:**
- **Left:** Platform icon + Pillar icon
  - ♪ = TikTok | ◎ = Instagram | ▶ = YouTube
  - ⚖️ = Weight Loss | 💪 = TRT | ✨ = HRT | 🌿 = Lifestyle | 💬 = Testimonials
- **Right:** Assignee avatar (colored circle with emoji)

**Middle:**
- **Title:** Content headline (truncated to 2 lines)

**Bottom Row (Badges):**
- **Status Pill:** Color-coded status label
  - Draft (pink/burgundy)
  - In Review (amber)
  - Approved (green)
  - Scheduled (indigo)
  - Published (purple)
- **🕐 Time:** Publish time (if set)
- **💬 Count:** Number of comments (if any)
- **🔔 Bell:** Reminder is set (if enabled)
- **⚠ Overdue:** Deadline passed (red, if overdue)

### Card Colors:
- **Left border:** Platform color
  - TikTok: Cyan (#00F2EA)
  - Instagram: Pink (#E1306C)
  - YouTube: Red (#FF0000)
- **Background:** White, changes to light pink on hover
- **Overdue:** Red background (#FEE2E2)

---

## 🖱️ Interacting with Content

### Drag & Drop Rescheduling

**How It Works:**
1. Click and hold any content card
2. Drag to a different day
3. Release to drop
4. ✅ Instant update on calendar
5. 🔄 Syncs to Google Sheets in background

**Visual Feedback:**
- Card follows cursor while dragging
- Target day highlights on hover
- Updates `publishDate` field in spreadsheet

**Use Cases:**
- Reschedule content quickly
- Rebalance content across days
- Adjust to changing plans
- Drag from one week/month to another (use navigation first)

---

### Click Actions

**Click Empty Day:**
- Opens "Add Content" modal
- Pre-fills publish date with clicked day
- Ready to create new content

**Click Content Card:**
- Opens "Edit Content" modal
- Shows all content details
- Can edit or delete

**Click + Add/Edit:**
- ✅ Instant optimistic update
- Card appears/updates immediately
- 🔄 Syncs to Google Sheets
- ⚠ Reverts if sync fails (with error message)

---

## ➕ Creating Content

### Add Content Modal

Triggered by clicking any calendar day. Contains **5 tabs**:

#### Tab 1: **Details** ⚙️

**Fields:**
- **Title*** (required)
  - Text input
  - Main content headline

- **Publish Date*** (required)
  - Date picker (YYYY-MM-DD)
  - Pre-filled with clicked day
  - Can change to any date

- **Publish Time** (optional)
  - Time picker (HH:MM, 24-hour)
  - Example: 14:30 for 2:30 PM
  - Displays as 12-hour on card

- **Deadline** (optional)
  - Date picker
  - Content creation deadline
  - Shows "⚠ Overdue" if passed

- **Platform*** (required)
  - Button selector: TikTok | Instagram | YouTube
  - Color-coded buttons
  - Single selection

- **Content Pillar*** (required)
  - Button selector with 5 options
  - Weight Loss | TRT | HRT | Lifestyle | Testimonials
  - Color-coded, with icons

- **Assign To*** (required)
  - Circular avatar buttons
  - Shows all team members
  - Defaults to current user

- **Status*** (required)
  - Dropdown selector
  - Draft | In Review | Approved | Scheduled | Published

- **Content Type*** (required)
  - Dropdown selector
  - 8 types available (Educational, Testimonial, Q&A, etc.)

- **🔔 Set Deadline Reminder**
  - Checkbox
  - Future feature for Slack/Email notifications

#### Tab 2: **Content** 📝

**Caption/Script:**
- Large text area
- Write full post caption or video script
- Multi-line support
- No character limit

**Suggested Hashtags:**
- Auto-generated based on platform + pillar
- Platform-specific hashtag sets:
  - **TikTok:** Short, trending format (#glp1 #fyp)
  - **Instagram:** Longer, branded (#glp1weightloss #fountainhealth)
  - **YouTube:** Comma-separated keywords (glp-1, weight loss)
- **"Add to Caption" button** - Appends hashtags to caption
- Updates when platform or pillar changes

**Example:**
```
Platform: TikTok + Pillar: Weight Loss
Suggested: #glp1 #weightlosstiktok #ozempic #semaglutide #fyp

Platform: Instagram + Pillar: TRT
Suggested: #testosteronetherapy #menshealth #hormoneoptimization
```

#### Tab 3: **Assets** 🎨

**Asset Links List:**
- Visual list of all attached assets
- Shows icon, label, URL for each
- Click URL to open in new tab

**Add New Asset:**
- **Type dropdown:** Canva | Drive | Other
  - 🎨 Canva designs
  - 📁 Google Drive files
  - 🔗 Other links
- **Label field:** Description (e.g., "Final Video")
- **URL field:** Full link
- **Add button** - Adds to list

**Stored as JSON:**
```json
[
  {"type":"canva","url":"https://...","label":"Video Edit"},
  {"type":"drive","url":"https://...","label":"Raw Footage"}
]
```

#### Tab 4: **Comments** 💬

**Comment Thread:**
- Displays all comments in chronological order
- Each comment shows:
  - Author avatar (colored circle)
  - Author name
  - Timestamp (date + time)
  - Comment text

**Add Comment:**
- Text input at bottom
- **Send button** or press **Enter**
- Auto-adds current user as author
- Includes timestamp

**Use Cases:**
- Feedback from reviewers
- Design notes
- Production updates
- Approval discussions
- General collaboration

#### Tab 5: **Approval** ✅

**Reviewer Assignment:**
- Avatar selector (same as Assign To)
- Choose who should review this content
- Optional field (can be "None")

**Approval Status Box:**

**States:**

1. **Not in Review:**
   ```
   Set status to "In Review" and assign a reviewer 
   to enable approval workflow
   ```

2. **Awaiting Review:**
   ```
   ⏳ Awaiting review from [Reviewer Name]
   
   [✓ Approve Content] button
   ```

3. **Approved:**
   ```
   ✓ Approved
   By [Approver Name] on [Date]
   ```

**Approval Flow:**
1. Creator sets status to "In Review"
2. Assigns reviewer
3. Reviewer clicks "✓ Approve Content"
4. Auto-updates:
   - Status → "Approved"
   - ApprovedBy → Reviewer's ID
   - ApprovedAt → Current timestamp

---

### Modal Footer Actions

**Cancel Button:**
- Closes modal
- No changes saved
- Returns to calendar

**Delete Button** (Edit mode only):
- Red button, left side
- Permanently removes content
- Confirms deletion
- ⚠ Cannot be undone

**Save/Add Button:**
- "Add Content" (new) or "Save Changes" (edit)
- Primary action button
- ✅ Instant UI update
- 🔄 Syncs to Google Sheets
- Closes modal on success

---

## 🔍 Search & Find Content

### Search Bar

Located directly below the header, the search bar helps you quickly find specific content.

**Search Across:**
- Title
- Caption text
- Platform (TikTok, Instagram, YouTube)
- Content Type (Educational, Testimonial, etc.)
- Content Pillar (Weight Loss, TRT, HRT, etc.)

**Features:**
- ⚡ Real-time filtering as you type
- 🔄 Works alongside regular filters
- ❌ Clear button to reset
- 📊 Shows count of filtered results

**Pro Tips:**
- Search "testimonial" to find all patient stories
- Search "TikTok" to see platform-specific content
- Search keywords from captions to find specific posts
- Combine search with filters for precise results

---

## ✅ Bulk Operations

### Multi-Select & Batch Actions

Manage multiple content pieces at once with bulk operations.

**How to Use:**

1. **Select Content:**
   - Click checkboxes on content cards
   - Or click "Select All" to select all visible content

2. **Bulk Actions Bar Appears:**
   Once items are selected, a blue action bar appears showing:
   - Number of items selected
   - Quick action buttons
   - Clear selection button

**Available Bulk Actions:**

### ✓ Approve All
Batch approve multiple content pieces
- Changes status to "Approved"
- Useful for reviewing week's content at once

### ⏳ Set to Review
Move multiple items to review status
- Changes status to "In Review"
- Ready for team review

### 📅 Schedule All
Batch schedule content
- Changes status to "Scheduled"
- Good for final scheduling step

### 👥 Reassign
Change assignee for multiple items
- Select new team member from dropdown
- Instantly reassigns all selected content
- Great for workload balancing

### 🗑️ Delete
Remove multiple items at once
- **Warning:** Asks for confirmation
- Permanently deletes selected content
- Use carefully!

**Use Cases:**
- ✅ Approve entire week's content after review
- 📊 Reassign 10+ posts when team member changes
- 🗑️ Clean up old draft content
- 📅 Batch schedule approved content

**Tips:**
- Use filters first to narrow selection
- "Select All" only selects visible/filtered content
- Can deselect individual items by unchecking
- Bulk operations sync to Google Sheets

---

## 📋 Duplicate Content

### Clone Existing Posts

Quickly create copies of existing content with one click.

**How to Use:**

1. Click any content card to open editor
2. Click **📋 Duplicate** button (bottom left)
3. Modal opens with duplicated content:
   - Title has " (Copy)" appended
   - Status reset to "Draft"
   - Publish date cleared (so you set new one)
   - Comments cleared (fresh start)
   - All other fields copied (caption, platform, type, etc.)
4. Edit as needed
5. Set new publish date
6. Save

**Perfect For:**

- 🔄 **Recurring Posts** - Duplicate last month's post
- 🎨 **Variations** - Create similar content for different platforms
- 📝 **Templates** - Duplicate well-performing posts
- ⏰ **Time-Saving** - Skip retyping captions/hashtags
- 🔁 **Series** - Create content series quickly

**What Gets Duplicated:**
- ✅ Title (with " (Copy)")
- ✅ Caption & hashtags
- ✅ Platform, Type, Pillar
- ✅ Asset links
- ✅ Assignee
- ✅ Reviewer
- ✅ Publish time

**What Gets Reset:**
- 🔄 Status → Draft
- 🔄 Publish date → Blank
- 🔄 Comments → Cleared
- 🔄 Approval info → Cleared

**Example Workflow:**
1. Find successful post from last month
2. Click card → Click "Duplicate"
3. Update title and caption slightly
4. Set new publish date (next month)
5. Save → New content created!

---

## 🌙 Dark Mode

### Toggle Light/Dark Theme

Switch between light and dark color schemes for comfortable viewing.

**How to Activate:**

Click the **🌙 moon icon** (light mode) or **☀️ sun icon** (dark mode) in the header.

**Dark Mode Features:**

- 🎨 **Dark Backgrounds** - Easy on the eyes
- 💡 **High Contrast** - Content cards stand out
- 🌈 **Preserved Colors** - Platform and status colors remain vibrant
- 💾 **Saved Preference** - Choice persists between sessions
- ⚡ **Smooth Transition** - Animated theme switch

**When to Use Dark Mode:**
- 🌙 Working late at night
- 💻 Extended screen time
- 👀 Reduce eye strain
- 🎭 Personal preference
- 📱 Match system theme

**What Changes in Dark Mode:**
- Background: Light pink gradient → Dark blue/grey gradient
- Calendar days: White → Dark grey
- Content cards: White → Dark with pink borders
- Text: Dark grey → Light grey
- Modals: Light → Dark themed
- All inputs and buttons adapt

**Persistence:**
Your theme choice is saved in browser localStorage and will be remembered next time you visit!

---

## 📥 Download Spreadsheet Data

### Export to CSV

Access via **📥 Download** button in header.

**Purpose:**
- Export your entire calendar to CSV files
- Backup your content data
- Import into other tools
- Share with team members
- Archive for records

**What Gets Downloaded:**

When you click the Download button, it automatically downloads **2 CSV files**:

1. **Content_Export_[DATE].csv**
   - All your content entries
   - Complete with all fields (title, platform, dates, captions, etc.)
   - JSON fields properly formatted
   - Ready to import into Google Sheets or Excel

2. **Team_Export_[DATE].csv**
   - All team member information
   - IDs, names, avatars, colors, roles
   - Ready to import or share

**File Format:**
- Standard CSV format
- Compatible with Google Sheets, Excel, Numbers
- UTF-8 encoding for emoji support
- Properly escaped quotes and commas

**Use Cases:**
- 📊 **Backup** - Save a snapshot of your calendar
- 🔄 **Migration** - Move data to another system
- 📈 **Analysis** - Import into spreadsheet for reporting
- 👥 **Sharing** - Send to stakeholders who don't have access
- 📝 **Archive** - Keep historical records
- 🔍 **Audit** - Review past content planning

**How It Works:**
1. Click **📥 Download** button in header
2. Two CSV files download automatically (500ms apart)
3. Files are named with current date
4. Open in any spreadsheet application
5. Data is exactly as shown in calendar

**Note:** If you're using the calendar in demo mode (no Google Sheets connection), this downloads the mock data currently displayed.

---

## 📋 Recurring Templates

### Templates Modal

Access via **📋 Templates** button in header.

**Pre-Built Templates:**
1. **Transformation Tuesday**
   - Every Tuesday
   - Instagram
   - Testimonial type
   - Patient Stories pillar

2. **FAQ Friday**
   - Every Friday
   - TikTok
   - Q&A type
   - Weight Loss pillar

3. **Wellness Wednesday**
   - Every Wednesday
   - YouTube
   - Educational type
   - Lifestyle pillar

4. **Monday Motivation**
   - Every Monday
   - Instagram
   - Testimonial type
   - Patient Stories pillar

**How Templates Work:**
1. Click any template card
2. Automatically creates new content with:
   - Title = Template name
   - Day = Next occurrence of that weekday (starting from tomorrow)
   - Platform, Type, Pillar = Pre-set
   - Status = Draft
   - Assignee = Current user
   - Default time = 10:00 AM
3. ✅ Appears on calendar immediately
4. 📅 Calendar automatically navigates to show the new content
5. Edit to customize

**Use Cases:**
- Maintain consistent posting schedule
- Quick-create recurring content
- Ensure weekly content themes
- Save time on setup

---

## ❓ Interactive Help Guide

### How It Works Modal

Access via **❓ How It Works** button in header.

**Purpose:**
- Quick reference guide built into the calendar
- Learn features without leaving the app
- Step-by-step instructions
- Tips and best practices

**4 Tab Sections:**

#### 1. **Overview Tab**
- What the calendar does
- Key sections explained
- Understanding content cards
- Icon legend and meanings

#### 2. **Creating Content Tab**
- How to add new content
- Using templates
- Content form tabs explained
- Status workflow diagram

#### 3. **Features Tab**
- Drag & drop instructions
- Filter options explained
- Month vs Week views
- Real-time sync details
- Smart hashtag system

#### 4. **Tips Tab**
- Pro tips for planning
- Workflow best practices
- Team collaboration tips
- Content strategy advice
- Quick actions reference

**Benefits:**
- ✅ Always accessible in-app
- ✅ No need to switch to external documentation
- ✅ Organized by topic with tabs
- ✅ Quick reference for new users
- ✅ Updated alongside feature releases

**When to Use:**
- First time using the calendar
- Learning a specific feature
- Need quick reminder on workflow
- Training new team members
- Brushing up on tips

---

## 💡 Suggestions & Feedback

### Suggestion Form

Access via **💡 Suggestions** button in header.

**Purpose:**
- Submit feature requests
- Report bugs
- Suggest improvements
- Provide general feedback

**Form Fields:**

1. **Your Name (Optional)**
   - Text input
   - Helps identify who sent the suggestion
   - Auto-filled with current user if left blank

2. **Your Email (Optional)**
   - Email input
   - For follow-up questions
   - Not required

3. **Suggestion Type**
   - Dropdown selector with 4 options:
     - 💡 **Feature Request** - New feature ideas
     - 🐛 **Bug Report** - Something isn't working
     - ✨ **Improvement** - Enhancement to existing features
     - 💬 **General Feedback** - Other comments

4. **Message*** (Required)
   - Large text area
   - Describe your suggestion in detail
   - Required field - cannot submit empty

**How It Works:**
1. Click **💡 Suggestions** button
2. Fill out the form
3. Click **📧 Send Suggestion**
4. Opens your default email client
5. Email pre-populated with:
   - **To:** daniel@fountain.net
   - **Subject:** Content Calendar Suggestion: [Type]
   - **Body:** Your formatted message
6. Click Send in your email client

**Email Format:**
```
From: [Your Name] ([Your Email])
Type: [Suggestion Type]

Message:
[Your detailed message]
```

**Use Cases:**
- 💡 Request new features (e.g., "Add bulk delete option")
- 🐛 Report bugs (e.g., "Drag & drop not working on Safari")
- ✨ Suggest improvements (e.g., "Add keyboard shortcuts")
- 💬 General feedback (e.g., "Love the new design!")

**Benefits:**
- Direct line to the developer
- Quick and easy feedback submission
- No external tools required
- Trackable via email thread

---

## 🎨 Visual Design & Theme

### Color Scheme
- **Primary:** Pink gradient (#EC4899, #DB2777)
- **Background:** Soft pink gradient (#FFF5F7, #FCE7F3, #FDF2F8)
- **Font:** DM Sans (body), Space Mono (headers)
- **Accent:** Burgundy (#9D174D, #831843)

### Platform Colors
- **TikTok:** Cyan (#00F2EA)
- **Instagram:** Hot Pink (#E1306C)
- **YouTube:** Red (#FF0000)

### Status Colors
- **Draft:** Burgundy on light gray
- **Review:** Amber on cream
- **Approved:** Green on mint
- **Scheduled:** Indigo on lavender
- **Published:** Purple on light purple

### Interactive Effects
- **Hover:** Cards lift slightly, brighten
- **Active Filters:** Highlighted button state
- **Drag:** Card follows cursor smoothly
- **Modals:** Slide-up animation with blur backdrop

---

## 🔄 Sync & Data Management

### Real-Time Sync
- **Auto-refresh:** Every 60 seconds
- **Polls Google Sheets** for latest data
- **Updates calendar** with new content
- **Background process** - doesn't interrupt work

### Optimistic Updates
- **Instant UI feedback** when you make changes
- **Background sync** to Google Sheets
- **Auto-revert** if sync fails (with error notice)
- **Smooth UX** - no waiting for server responses

### Data Flow
```
You → Calendar UI → Google Sheets → Back to Calendar
         ↓                              ↑
    (instant)                      (60s polling)
```

**What This Means:**
- Your changes appear immediately
- Other team members see changes within 60 seconds
- No refresh button needed
- Handles multiple users editing simultaneously

### Error Handling
- **Sync Failures:** Red error banner at top
- **Automatic Retry:** Failed operations stored, can retry
- **User Notification:** Clear error messages
- **Graceful Degradation:** Calendar stays functional

---

## 👥 Multi-User Support

### User Profiles
- Each team member has unique ID, avatar, color
- Stored in Google Sheets Team tab
- Synced to all users

### User Selection
- Select profile on first visit
- Saved to browser localStorage
- Persists between sessions
- Sets default assignee for new content

### Collaborative Features
- **Comments:** Team discussion on each content
- **Assignee:** Who's responsible for creating
- **Reviewer:** Who's responsible for reviewing
- **Approval Tracking:** Who approved and when
- **Real-time Sync:** See updates from teammates

### Permissions
- Currently: All users can do everything
- Future: Role-based permissions possible
  - Content Creators: Can create/edit own content
  - Managers: Can approve any content
  - Admins: Full access

---

## 📊 Platform Legend

Located at bottom of calendar, shows all available options:

### Platforms
- ♪ TikTok
- ◎ Instagram
- ▶ YouTube

### Content Pillars
- ⚖️ Weight Loss / GLP-1
- 💪 TRT
- ✨ HRT
- 🌿 Lifestyle & Wellness
- 💬 Patient Stories

**Quick Reference:**
- Color-coded for easy identification
- Matches card icons
- Consistent across entire interface

---

## 💡 Pro Tips & Best Practices

### Content Planning
✅ **Use Week View for detailed scheduling**
✅ **Use Month View for high-level planning**
✅ **Color-code by platform** to ensure variety
✅ **Balance pillars** across the week
✅ **Set deadlines** 2-3 days before publish date

### Workflow Optimization
✅ **Create in batches** - use templates for recurring content
✅ **Review daily** - check overdue items regularly
✅ **Use comments** - communicate with team in-app
✅ **Approve before scheduling** - maintain quality control
✅ **Set reminders** - don't miss deadlines

### Team Collaboration
✅ **Assign content early** - give creators enough time
✅ **Review promptly** - don't block the pipeline
✅ **Comment on assets** - provide specific feedback
✅ **Track status** - know what's ready to publish
✅ **Use filters** - focus on your assigned content

### Content Strategy
✅ **Post consistently** - aim for X posts per platform per week
✅ **Vary content types** - mix educational, testimonials, Q&A
✅ **Balance pillars** - cover all treatment areas
✅ **Track published** - see what's working
✅ **Plan ahead** - schedule 2-4 weeks in advance

---

## ⚙️ Advanced Features

### Keyboard Shortcuts
- **Enter** - Submit comment (in comment field)
- **Escape** - Close modal (coming soon)

### URL Structure
- Currently: Single page app, no URL routing
- Future: Deep links to specific dates/content possible

### Browser Storage
- **localStorage:** Saves selected user profile
- **Session:** Filters persist during session only
- **Cookies:** Not used

### Performance
- **Fast Loading:** Optimized React components
- **Smooth Animations:** CSS transitions
- **Efficient Rendering:** Only updates changed elements
- **Polling Throttle:** 60s interval prevents server overload

---

## 🐛 Troubleshooting

### Common Issues

**❓ Content not appearing on calendar**
- Check that publishDate is valid (YYYY-MM-DD)
- Check if filters are hiding it
- Verify content exists in Google Sheet
- Wait for next 60s sync cycle

**❓ Changes not saving**
- Check internet connection
- Look for error banner at top
- Verify Google Sheets API URL is set
- Check browser console for errors

**❓ Drag & drop not working**
- Ensure content has valid date
- Try refreshing the page
- Check that card is fully loaded (not during sync)

**❓ Filters not working**
- Click "Clear" to reset filters
- Check that values match exactly (case-sensitive)
- Refresh page if filters stuck

**❓ User profile not saving**
- Check browser localStorage enabled
- Try selecting again
- Clear cache and retry

**❓ Hashtags not appearing**
- Select both platform AND pillar
- Some combinations may not have hashtags
- Add custom hashtags manually if needed

---

## 🚀 What's Next?

### Recently Added Features ✅
- 🔍 **Search** - Find content instantly by title, caption, platform, type, or pillar
- ✅ **Bulk Operations** - Multi-select and batch update status, reassign, or delete
- 📋 **Duplicate Content** - Clone existing posts with one click
- 🌙 **Dark Mode** - Toggle between light and dark themes (persists in localStorage)
- 📥 Download spreadsheet data as CSV files
- 💡 Suggestion form (sends to daniel@fountain.net)
- ❓ Interactive "How It Works" guide built into the website
- 🔧 Fixed templates to automatically navigate to created content

### Roadmap Features (Not Yet Implemented)
- 📧 Email/Slack deadline reminders (automated)
- 🔔 Push notifications for approvals
- 📈 Analytics dashboard
- 📅 Bulk operations
- 🔍 Search functionality
- 📎 File uploads (not just links)
- 🎨 Custom templates (user-created)
- 👥 Role-based permissions
- 📱 Mobile app
- 🌙 Dark mode

---

## 📞 Support & Questions

**Need Help?**
- Contact your team lead
- Refer to `SPREADSHEET_FORMAT_GUIDE.md` for data structure
- Check `README.md` for technical setup
- Review Google Sheets for data accuracy

**Feature Requests?**
- Submit to content team lead
- Include use case and priority
- Describe expected behavior

---

**That's everything! You're now a Content Calendar expert. 📅✨**

