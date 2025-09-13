// Admin Panel Configuration
module.exports = {
  // API Configuration
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://gwsudan.xyz',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Admin Panel Settings
  ADMIN_PANEL_URL: process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3000',
  
  // Backend Configuration
  BACKEND_URL: 'https://gwsudan.xyz',
  BACKEND_PORT: 443, // HTTPS port
  BACKEND_PROTOCOL: 'https'
};
