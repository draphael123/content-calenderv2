# 🚀 Quick Start Guide - Content Calendar Spreadsheets

## 📁 Files Created for You

I've created several spreadsheet files to help you understand the layout:

### 1. **SPREADSHEET_FORMAT_GUIDE.md** (THIS FILE IS KEY! 📖)
   - Complete documentation of all fields
   - Valid values for each column
   - JSON format examples
   - Common mistakes to avoid
   - **👉 START HERE for detailed information**

### 2. **Content_Sheet_Template_Empty.csv**
   - Empty template with just headers
   - Ready to fill with your own content
   - Use this to start fresh

### 3. **Content_Sheet_Template_With_Examples.csv**
   - 10 example content entries
   - Shows all different platforms, statuses, and types
   - Use this to see how real data looks
   - **👉 BEST for understanding the format**

### 4. **Team_Sheet_Template.csv**
   - Team member information
   - Already filled with 5 example team members
   - Customize with your actual team

### 5. **Content_Calendar_Template.csv**
   - Combined template with 3 sample entries
   - Quick reference version

---

## 🎯 How Spreadsheet Data Appears on Website

Here's how each spreadsheet field displays on the website:

### Content Card (appears on calendar)
```
┌─────────────────────────────┐
│ ♪ ⚖️               👩‍🎨      │  ← platform icon, pillar icon, assignee avatar
│                             │
│ GLP-1 Weight Loss Tips      │  ← title
│                             │
│ [Approved] 🕐 10:00 AM      │  ← status, publishTime
│ 💬 2  🔔                    │  ← comment count, reminder
└─────────────────────────────┘
```

**Spreadsheet Fields Used:**
- `platform` → Icon (♪ = TikTok, ◎ = Instagram, ▶ = YouTube)
- `pillar` → Icon (⚖️ = weight loss, 💪 = TRT, ✨ = HRT, etc.)
- `assignee` → Avatar circle (maps to Team sheet)
- `title` → Main text
- `status` → Status pill color and label
- `publishTime` → Time display
- `comments` → Count badge
- `reminderSet` → Bell icon (if true)

### Calendar Organization
- Each content appears on the date specified in `publishDate`
- Drag-and-drop updates the `publishDate` automatically
- Color-coded left border shows the `platform`

### Filters Available
Users can filter by:
- `assignee` - Show only content for specific team member
- `platform` - Show only TikTok, Instagram, or YouTube
- `status` - Show only Draft, Review, Approved, etc.
- `pillar` - Show only Weight Loss, TRT, HRT, etc.
- `type` - Show only Educational, Testimonial, Q&A, etc.

---

## 📝 Creating Your First Content Entry

### Minimum Required Fields:
```csv
id,title,platform,assignee,status,type,pillar,publishDate,publishTime,deadline,caption,assetLinks,comments,reviewer,approvedBy,approvedAt,reminderSet
1,My First Post,tiktok,1,draft,Educational,weightloss,2025-03-01,10:00,,,Caption text here,[],[],,,,,false
```

### Recommended Fields to Include:
```csv
id,title,platform,assignee,status,type,pillar,publishDate,publishTime,deadline,caption,assetLinks,comments,reviewer,approvedBy,approvedAt,reminderSet
1,My First Post,tiktok,1,draft,Educational,weightloss,2025-03-01,10:00,2025-02-28,Caption text here,[],[],,,,,false
```

---

## 🎨 Platform & Pillar Combinations

Popular combinations that work well together:

| Platform | Pillar | Typical Content Type |
|----------|--------|---------------------|
| TikTok | weightloss | Educational, Trending |
| TikTok | trt | Q&A, Educational |
| Instagram | testimonials | Testimonial, Behind-the-scenes |
| Instagram | hrt | Educational, Product |
| YouTube | weightloss | Educational, Q&A |
| YouTube | trt | Educational, Testimonial |

The website automatically suggests relevant hashtags based on your platform + pillar combination!

---

## 🔄 Typical Content Workflow

Follow this progression in the `status` field:

1. **draft** - Initial creation
   - Assignee creates content
   - Add caption, assets, set dates
   
2. **review** - Ready for review
   - Set `reviewer` to team lead's ID
   - Team lead adds comments
   
3. **approved** - Approved by reviewer
   - Website auto-fills `approvedBy` and `approvedAt`
   - Ready for scheduling
   
4. **scheduled** - Queued for publishing
   - Confirm final `publishDate` and `publishTime`
   - Assets finalized
   
5. **published** - Live on platform
   - Content is live
   - Track performance in comments

---

## ❓ Learning the Calendar

**Built-In Help:**
The calendar has a **❓ How It Works** button in the header that opens an interactive guide with:
- Overview of all features
- Step-by-step content creation
- Drag & drop instructions
- Tips and best practices

This is the fastest way to learn the system without leaving the app!

---

## 💡 Pro Tips

### JSON Fields Made Easy

**Asset Links** - Copy and customize:
```json
[{"type":"canva","url":"YOUR_URL_HERE","label":"Video Edit"}]
```

**Multiple Assets:**
```json
[{"type":"canva","url":"URL1","label":"Design"},{"type":"drive","url":"URL2","label":"Raw Files"}]
```

**No Assets:**
```json
[]
```

### Date/Time Format Quick Reference
- ✅ **Date:** `2025-03-15` (YYYY-MM-DD)
- ✅ **Time:** `14:30` (24-hour, HH:MM)
- ✅ **Timestamp:** `2025-03-15T14:30:00` (ISO format)
- ❌ **Wrong:** `3/15/2025`, `2:30 PM`, `March 15`

### Team Member IDs
Reference your Team sheet for IDs:
- Use the `id` number, not the name
- Example: Use `1` for "Momsh D", not "Momsh D"

---

## 📥 Importing to Google Sheets

### Step 1: Create the Sheets
1. Create new Google Sheet
2. Create two tabs: `Content` and `Team`

### Step 2: Import Team Data
1. Go to `Team` tab
2. File → Import → Upload → Choose `Team_Sheet_Template.csv`
3. Import location: **Replace current sheet**
4. Click "Import data"

### Step 3: Import Content Data
1. Go to `Content` tab
2. File → Import → Upload → Choose one of:
   - `Content_Sheet_Template_Empty.csv` (blank slate)
   - `Content_Sheet_Template_With_Examples.csv` (with examples)
3. Import location: **Replace current sheet**
4. Click "Import data"

### Step 4: Verify Headers
Make sure column names match **exactly**:
```
Content tab: id, title, platform, assignee, status, type, pillar, publishDate, publishTime, deadline, caption, assetLinks, comments, reviewer, approvedBy, approvedAt, reminderSet

Team tab: id, name, avatar, color, role
```

---

## 🔗 Next Steps

1. ✅ **Review** `SPREADSHEET_FORMAT_GUIDE.md` for complete details
2. ✅ **Open** `Content_Sheet_Template_With_Examples.csv` in Excel/Sheets to see examples
3. ✅ **Import** templates to your Google Sheet
4. ✅ **Customize** team members in Team sheet
5. ✅ **Add** your first content entry
6. ✅ **Connect** Google Sheet to website (see README.md)

---

## ❓ Need Help?

**Common Issues:**

**Q: My dates don't display correctly**
A: Make sure you're using `YYYY-MM-DD` format, not `MM/DD/YYYY`

**Q: JSON fields show as plain text**
A: That's correct! Google Sheets stores them as text, the website parses them

**Q: Assignee doesn't show an avatar**
A: Check that the assignee ID matches an ID in your Team sheet

**Q: Content doesn't appear on calendar**
A: Verify the `publishDate` field is formatted as `YYYY-MM-DD`

**Q: Can I add custom platforms or statuses?**
A: No, use only the values listed in `SPREADSHEET_FORMAT_GUIDE.md`

**Q: How do I request new features or report bugs?**
A: Click the **💡 Suggestions** button in the calendar header! Fill out the form and it will send your feedback directly to daniel@fountain.net via email.

---

**Happy scheduling! 📅✨**

