import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'beer.hoptrack.app',
  appName: 'HopTrack',
  webDir: 'out',
  server: {
    // In development, point to local dev server
    // url: 'http://localhost:3000',
    // cleartext: true,
  },
  ios: {
    scheme: 'HopTrack',
    contentInset: 'automatic',
    backgroundColor: '#0F0E0C',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0F0E0C',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#0F0E0C',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
