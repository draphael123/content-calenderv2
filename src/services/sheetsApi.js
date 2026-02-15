const API_URL = import.meta.env.VITE_SHEETS_API_URL;

export const sheetsApi = {
  async getAll() {
    if (!API_URL) {
      throw new Error('VITE_SHEETS_API_URL is not set in environment variables');
    }
    const res = await fetch(`${API_URL}?action=getAll`);
    if (!res.ok) {
      throw new Error(`Failed to fetch content: ${res.statusText}`);
    }
    return res.json();
  },
  
  async getTeam() {
    if (!API_URL) {
      throw new Error('VITE_SHEETS_API_URL is not set in environment variables');
    }
    const res = await fetch(`${API_URL}?action=getTeam`);
    if (!res.ok) {
      throw new Error(`Failed to fetch team: ${res.statusText}`);
    }
    return res.json();
  },
  
  async add(content) {
    if (!API_URL) {
      throw new Error('VITE_SHEETS_API_URL is not set in environment variables');
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
      throw new Error('VITE_SHEETS_API_URL is not set in environment variables');
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
      throw new Error('VITE_SHEETS_API_URL is not set in environment variables');
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

