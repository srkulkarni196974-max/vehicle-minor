import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vehicle.tracker',
  appName: 'Vehicle Tracker',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '313903102434-ls388t7r429j2v1m02t65om63375i7f9.apps.googleusercontent.com',
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
