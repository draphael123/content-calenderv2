const API_URL = import.meta.env.VITE_SHEETS_API_URL;

// Mock data for testing when API URL is not set
const mockTeam = [
  { id: 1, name: 'Momsh D', avatar: '👩‍🎨', color: '#E8B4B8', role: 'Content Lead' },
  { id: 2, name: 'Momsh V', avatar: '👨‍💻', color: '#A8D5BA', role: 'Video Editor' },
  { id: 3, name: 'Momsh A', avatar: '👩‍🎤', color: '#B8C9E8', role: 'Social Manager' },
  { id: 4, name: 'Momsh P', avatar: '🧑‍🎬', color: '#E8D4B8', role: 'Content Creator' },
  { id: 5, name: 'Momsh R', avatar: '👨‍🎨', color: '#D4B8E8', role: 'Content Creator' },
];

const mockContents = [
  { 
    id: 1, 
    title: 'GLP-1 Weight Loss Journey Tips', 
    platform: 'tiktok', 
    assignee: 1, 
    status: 'approved', 
    type: 'Educational', 
    pillar: 'weightloss',
    publishDate: '2025-02-03',
    publishTime: '10:00',
    deadline: '2025-02-01',
    caption: 'Here are 5 tips to maximize your GLP-1 results 💪 #glp1 #weightloss',
    assetLinks: [
      { type: 'canva', url: 'https://canva.com/design/abc123', label: 'Video Edit' },
    ],
    comments: [
      { id: 1, author: 3, text: 'Love the hook! Maybe add a CTA at the end?', timestamp: '2025-01-28T10:30:00' },
      { id: 2, author: 1, text: 'Good call, added "Link in bio"', timestamp: '2025-01-28T14:15:00' },
    ],
    reviewer: 3,
    approvedBy: 3,
    approvedAt: '2025-01-30T09:00:00',
    reminderSet: true,
  },
  { 
    id: 2, 
    title: 'Patient Transformation: Sarah M.', 
    platform: 'instagram', 
    assignee: 2, 
    status: 'review', 
    type: 'Testimonial', 
    pillar: 'testimonials',
    publishDate: '2025-02-05',
    publishTime: '12:00',
    deadline: '2025-02-03',
    caption: 'Sarah lost 45 lbs in 6 months with our GLP-1 program! 🎉 Swipe to see her journey →',
    assetLinks: [
      { type: 'drive', url: 'https://drive.google.com/file/xyz', label: 'Before/After Photos' },
      { type: 'canva', url: 'https://canva.com/design/def456', label: 'Carousel Design' },
    ],
    comments: [
      { id: 1, author: 1, text: 'Did we get written consent for this?', timestamp: '2025-02-01T11:00:00' },
    ],
    reviewer: 1,
    approvedBy: null,
    approvedAt: null,
    reminderSet: true,
  },
  { 
    id: 3, 
    title: 'Dr. Smith TRT Q&A Session', 
    platform: 'youtube', 
    assignee: 3, 
    status: 'draft', 
    type: 'Q&A', 
    pillar: 'trt',
    publishDate: '2025-02-07',
    publishTime: '14:00',
    deadline: '2025-02-05',
    caption: 'Dr. Smith answers your most asked questions about Testosterone Replacement Therapy. Timestamps in description!',
    assetLinks: [],
    comments: [],
    reviewer: null,
    approvedBy: null,
    approvedAt: null,
    reminderSet: false,
  },
  { 
    id: 4, 
    title: 'GLP-1 Myth Busters', 
    platform: 'tiktok', 
    assignee: 4, 
    status: 'published', 
    type: 'Educational', 
    pillar: 'weightloss',
    publishDate: '2025-02-10',
    publishTime: '09:00',
    deadline: '2025-02-08',
    caption: 'Debunking the top 3 GLP-1 myths 🚫 #glp1 #mythbusters #weightloss',
    assetLinks: [
      { type: 'canva', url: 'https://canva.com/design/ghi789', label: 'Final Video' },
    ],
    comments: [
      { id: 1, author: 1, text: 'Great engagement on this one! 45k views', timestamp: '2025-02-11T16:00:00' },
    ],
    reviewer: 1,
    approvedBy: 1,
    approvedAt: '2025-02-09T10:00:00',
    reminderSet: false,
  },
  { 
    id: 5, 
    title: 'Office Tour BTS', 
    platform: 'instagram', 
    assignee: 1, 
    status: 'draft', 
    type: 'Behind-the-scenes', 
    pillar: 'lifestyle',
    publishDate: '2025-02-12',
    publishTime: '11:00',
    deadline: '2025-02-10',
    caption: 'Take a peek inside our clinic! 👀 Meet the team helping you reach your health goals',
    assetLinks: [],
    comments: [],
    reviewer: null,
    approvedBy: null,
    approvedAt: null,
    reminderSet: false,
  },
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const sheetsApi = {
  async getAll() {
    if (!API_URL) {
      // Return mock data for testing
      await delay(500); // Simulate network delay
      return [...mockContents];
    }
    const res = await fetch(`${API_URL}?action=getAll`);
    if (!res.ok) {
      throw new Error(`Failed to fetch content: ${res.statusText}`);
    }
    return res.json();
  },
  
  async getTeam() {
    if (!API_URL) {
      // Return mock data for testing
      await delay(300); // Simulate network delay
      return [...mockTeam];
    }
    const res = await fetch(`${API_URL}?action=getTeam`);
    if (!res.ok) {
      throw new Error(`Failed to fetch team: ${res.statusText}`);
    }
    return res.json();
  },
  
  async add(content) {
    if (!API_URL) {
      // Mock mode: just return success
      await delay(300);
      console.log('📝 Mock mode: Would add content to Google Sheets', content);
      return { success: true, id: content.id };
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'add', data: content }),
    });
    if (!res.ok) {
      throw new Error(`Failed to add content: ${res.statusText}`);
    }
    return res.json();
  },
  
  async update(content) {
    if (!API_URL) {
      // Mock mode: just return success
      await delay(300);
      console.log('✏️ Mock mode: Would update content in Google Sheets', content);
      return { success: true, id: content.id };
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'update', data: content }),
    });
    if (!res.ok) {
      throw new Error(`Failed to update content: ${res.statusText}`);
    }
    return res.json();
  },
  
  async delete(id) {
    if (!API_URL) {
      // Mock mode: just return success
      await delay(300);
      console.log('🗑️ Mock mode: Would delete content from Google Sheets', id);
      return { success: true, id: id };
    }
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'delete', id }),
    });
    if (!res.ok) {
      throw new Error(`Failed to delete content: ${res.statusText}`);
    }
    return res.json();
  },
};

