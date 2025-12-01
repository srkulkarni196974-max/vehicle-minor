// API Configuration
// Automatically detects the correct backend URL based on how the app is accessed
const getApiUrl = () => {
    // 1. If environment variable is set, use it
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }

    // 2. In production, use the deployed backend
    if (import.meta.env.PROD) {
        return 'https://vehicle-management-backend-ap3f.onrender.com';
    }

    const hostname = window.location.hostname;

    // 3. SAFEGUARD: Explicitly check for deployed frontend domain
    // This prevents the "Mixed Content" error if PROD flag fails
    if (hostname.includes('netlify.app')) {
        return 'https://vehicle-management-backend-ap3f.onrender.com';
    }

    // 4. In development, check if accessed via network IP (for mobile testing)
    // Only use this if it's an IP address or local hostname, NOT a public domain
    if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.includes('netlify.app')) {
        return `http://${hostname}:5000`;
    }

    // 5. Default to localhost for local development
    return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

// WebSocket URL (same as API URL)
export const WS_URL = API_URL;

// Environment flags
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
