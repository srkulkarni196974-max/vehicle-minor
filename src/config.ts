// API Configuration
// In development, this will use localhost
// In production, this will use the deployed backend URL set via VITE_API_URL env variable
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// WebSocket URL for real-time features
export const WS_URL = import.meta.env.VITE_WS_URL || API_URL;

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
