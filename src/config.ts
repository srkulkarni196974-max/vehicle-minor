// API Configuration
// Automatically uses environment variable in production, localhost in development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// WebSocket URL (same as API URL)
export const WS_URL = API_URL;

// Environment flags
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// For mobile testing on local network, you can temporarily set:
// export const API_URL = 'http://192.168.29.240:5000';
