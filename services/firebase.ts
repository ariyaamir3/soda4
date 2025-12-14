import { SiteContent, FullRegistrationData, ContactMessage, DEFAULT_CONTENT } from '../types';

const API_URL = '/api';

export const getConnectionStatus = () => ({ isConnected: true, error: null });

export const getSiteContent = async (): Promise<SiteContent> => {
  try {
    const res = await fetch(`${API_URL}/content`);
    const data = await res.json();
    return data && data.menuItems ? data : DEFAULT_CONTENT;
  } catch (e) {
    return DEFAULT_CONTENT;
  }
};

export const updateSiteContent = async (newContent: SiteContent): Promise<void> => {
  await fetch(`${API_URL}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newContent)
  });
};

export const submitRegistration = async (data: FullRegistrationData) => {
  const res = await fetch(`${API_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed');
  return true;
};

export const getRegistrations = async () => {
  try {
    const res = await fetch(`${API_URL}/registrations`);
    return await res.json();
  } catch { return []; }
};

export const submitContactMessage = async (data: ContactMessage) => {
  await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return true;
};

export const getContactMessages = async () => {
  try {
    const res = await fetch(`${API_URL}/messages`);
    return await res.json();
  } catch { return []; }
};

export const uploadFile = async (file: File, path?: string, onProgress?: any): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  if(onProgress) onProgress(50);
  
  const res = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  
  const data = await res.json();
  if(onProgress) onProgress(100);
  return data.url;
};

export const saveFirebaseConfig = () => {};
export const resetFirebaseConfig = () => {};
export const syncLocalToCloud = async () => "Sync OK";
