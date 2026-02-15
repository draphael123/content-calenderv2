/**
 * Content Calendar - Google Apps Script Backend
 * 
 * Deploy as Web App:
 * 1. Extensions → Apps Script
 * 2. Paste this code
 * 3. Update SHEET_ID below
 * 4. Deploy → New deployment → Web app
 * 5. Execute as: Me | Access: Anyone
 */

// ============================================
// CONFIGURATION - UPDATE THIS
// ============================================
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Get from sheet URL: docs.google.com/spreadsheets/d/[THIS_PART]/edit

// ============================================
// CONSTANTS
// ============================================
const CONTENT_SHEET = 'Content';
const TEAM_SHEET = 'Team';

const CONTENT_COLUMNS = [
  'id', 'title', 'platform', 'assignee', 'status', 'type', 'pillar',
  'publishDate', 'publishTime', 'deadline', 'caption', 'assetLinks',
  'comments', 'reviewer', 'approvedBy', 'approvedAt', 'reminderSet'
];

const TEAM_COLUMNS = ['id', 'name', 'avatar', 'color', 'role'];

// ============================================
// WEB APP ENTRY POINTS
// ============================================

/**
 * Handle GET requests
 * @param {Object} e - Event object with parameters
 */
function doGet(e) {
  const action = e.parameter.action;
  
  let result;
  
  switch (action) {
    case 'getAll':
      result = getAllContent();
      break;
    case 'getTeam':
      result = getTeam();
      break;
    default:
      result = { error: 'Invalid action. Use: getAll, getTeam' };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST requests
 * @param {Object} e - Event object with postData
 */
function doPost(e) {
  let result;
  
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    
    switch (action) {
      case 'add':
        result = addContent(payload.data);
        break;
      case 'update':
        result = updateContent(payload.data);
        break;
      case 'delete':
        result = deleteContent(payload.id);
        break;
      case 'addComment':
        result = addComment(payload.contentId, payload.comment);
        break;
      default:
        result = { error: 'Invalid action. Use: add, update, delete, addComment' };
    }
  } catch (error) {
    result = { error: error.message };
  }
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// CONTENT CRUD OPERATIONS
// ============================================

/**
 * Get all content items
 */
function getAllContent() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONTENT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return []; // Only headers or empty
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      
      // Parse JSON fields
      if (header === 'assetLinks' || header === 'comments') {
        try {
          value = value ? JSON.parse(value) : [];
        } catch {
          value = [];
        }
      }
      
      // Parse numbers
      if (header === 'id' || header === 'assignee' || header === 'reviewer' || header === 'approvedBy') {
        value = value ? Number(value) : null;
      }
      
      // Parse booleans
      if (header === 'reminderSet') {
        value = value === true || value === 'TRUE' || value === 'true';
      }
      
      obj[header] = value;
    });
    return obj;
  }).filter(item => item.id); // Filter out empty rows
}

/**
 * Add new content item
 * @param {Object} content - Content object
 */
function addContent(content) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONTENT_SHEET);
  
  // Ensure ID exists
  if (!content.id) {
    content.id = Date.now();
  }
  
  // Build row in correct column order
  const row = CONTENT_COLUMNS.map(col => {
    let value = content[col];
    
    // Stringify JSON fields
    if (col === 'assetLinks' || col === 'comments') {
      value = JSON.stringify(value || []);
    }
    
    // Handle nulls
    if (value === null || value === undefined) {
      value = '';
    }
    
    return value;
  });
  
  sheet.appendRow(row);
  
  return { success: true, id: content.id };
}

/**
 * Update existing content item
 * @param {Object} content - Content object with id
 */
function updateContent(content) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONTENT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // Find row with matching ID
  const idColIndex = 0; // Column A
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][idColIndex]) === Number(content.id)) {
      rowIndex = i + 1; // Sheet rows are 1-indexed
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Content not found', id: content.id };
  }
  
  // Build updated row
  const row = CONTENT_COLUMNS.map(col => {
    let value = content[col];
    
    // Stringify JSON fields
    if (col === 'assetLinks' || col === 'comments') {
      value = JSON.stringify(value || []);
    }
    
    // Handle nulls
    if (value === null || value === undefined) {
      value = '';
    }
    
    return value;
  });
  
  // Update the row
  const range = sheet.getRange(rowIndex, 1, 1, row.length);
  range.setValues([row]);
  
  return { success: true, id: content.id };
}

/**
 * Delete content item
 * @param {number} id - Content ID
 */
function deleteContent(id) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONTENT_SHEET);
  const data = sheet.getDataRange().getValues();
  
  // Find row with matching ID
  const idColIndex = 0;
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][idColIndex]) === Number(id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Content not found', id: id };
  }
  
  sheet.deleteRow(rowIndex);
  
  return { success: true, id: id };
}

/**
 * Add comment to content item
 * @param {number} contentId - Content ID
 * @param {Object} comment - Comment object {author, text, timestamp}
 */
function addComment(contentId, comment) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CONTENT_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Find columns
  const idColIndex = headers.indexOf('id');
  const commentsColIndex = headers.indexOf('comments');
  
  // Find row
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (Number(data[i][idColIndex]) === Number(contentId)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { error: 'Content not found', id: contentId };
  }
  
  // Get existing comments
  let comments = [];
  try {
    const existing = data[rowIndex - 1][commentsColIndex];
    comments = existing ? JSON.parse(existing) : [];
  } catch {
    comments = [];
  }
  
  // Add new comment
  comment.id = Date.now();
  comments.push(comment);
  
  // Update cell
  sheet.getRange(rowIndex, commentsColIndex + 1).setValue(JSON.stringify(comments));
  
  return { success: true, comment: comment };
}

// ============================================
// TEAM OPERATIONS
// ============================================

/**
 * Get all team members
 */
function getTeam() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(TEAM_SHEET);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    // Return default team if sheet is empty
    return [
      { id: 1, name: 'Sarah', avatar: '👩‍🎨', color: '#E8B4B8', role: 'Content Lead' },
      { id: 2, name: 'Marcus', avatar: '👨‍💻', color: '#A8D5BA', role: 'Video Editor' },
      { id: 3, name: 'Jenna', avatar: '👩‍🎤', color: '#B8C9E8', role: 'Social Manager' },
      { id: 4, name: 'Tyler', avatar: '🧑‍🎬', color: '#E8D4B8', role: 'Content Creator' },
    ];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if (header === 'id') {
        value = Number(value);
      }
      obj[header] = value;
    });
    return obj;
  }).filter(item => item.id);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Initialize sheets with headers (run once)
 */
function initializeSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Content sheet
  let contentSheet = ss.getSheetByName(CONTENT_SHEET);
  if (!contentSheet) {
    contentSheet = ss.insertSheet(CONTENT_SHEET);
  }
  contentSheet.getRange(1, 1, 1, CONTENT_COLUMNS.length).setValues([CONTENT_COLUMNS]);
  
  // Team sheet
  let teamSheet = ss.getSheetByName(TEAM_SHEET);
  if (!teamSheet) {
    teamSheet = ss.insertSheet(TEAM_SHEET);
  }
  teamSheet.getRange(1, 1, 1, TEAM_COLUMNS.length).setValues([TEAM_COLUMNS]);
  
  // Add default team
  const defaultTeam = [
    [1, 'Sarah', '👩‍🎨', '#E8B4B8', 'Content Lead'],
    [2, 'Marcus', '👨‍💻', '#A8D5BA', 'Video Editor'],
    [3, 'Jenna', '👩‍🎤', '#B8C9E8', 'Social Manager'],
    [4, 'Tyler', '🧑‍🎬', '#E8D4B8', 'Content Creator'],
  ];
  teamSheet.getRange(2, 1, defaultTeam.length, TEAM_COLUMNS.length).setValues(defaultTeam);
  
  Logger.log('Sheets initialized!');
}

/**
 * Test function - get all content
 */
function testGetAll() {
  const result = getAllContent();
  Logger.log(JSON.stringify(result, null, 2));
}

/**
 * Test function - add sample content
 */
function testAdd() {
  const sample = {
    id: Date.now(),
    title: 'Test Content',
    platform: 'tiktok',
    assignee: 1,
    status: 'draft',
    type: 'Educational',
    pillar: 'weightloss',
    publishDate: '2025-02-15',
    publishTime: '10:00',
    deadline: '2025-02-14',
    caption: 'Test caption',
    assetLinks: [],
    comments: [],
    reviewer: null,
    approvedBy: null,
    approvedAt: null,
    reminderSet: false
  };
  
  const result = addContent(sample);
  Logger.log(JSON.stringify(result, null, 2));
}
