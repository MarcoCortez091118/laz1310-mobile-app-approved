const googleServicesFile = process.env.GOOGLE_SERVICES_JSON;
const googleServiceInfoPlist = process.env.GOOGLE_SERVICE_INFO_PLIST;
const productionPush =
  process.env.EAS_BUILD_PROFILE === 'production' || process.env.NODE_ENV === 'production';

module.exports = ({ config }) => ({
  ...config,
  owner: 'neuromarket-llc',
  name: 'LA Z 1310',
  slug: 'laz1310-mobile-app',
  scheme: 'laz1310',
  version: '0.1.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/brand/la-z-launcher-icon.png',
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.neuromarket.laz1310',
    entitlements: {
      'aps-environment': productionPush ? 'production' : 'development',
    },
    infoPlist: {
      UIBackgroundModes: ['remote-notification'],
    },
    ...(googleServiceInfoPlist
      ? { googleServicesFile: googleServiceInfoPlist }
      : {}),
  },
  android: {
    package: 'com.neuromarket.laz1310',
    permissions: ['android.permission.POST_NOTIFICATIONS'],
    ...(googleServicesFile ? { googleServicesFile } : {}),
    adaptiveIcon: {
      foregroundImage: './assets/brand/la-z-adaptive-foreground.png',
      backgroundColor: '#050101',
    },
  },
  plugins: [
    'expo-router',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    '@react-native-firebase/app-check',
    '@react-native-firebase/messaging',
    [
      'expo-notifications',
      {
        enableBackgroundRemoteNotifications: true,
      },
    ],
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    [
      'expo-audio',
      {
        enableBackgroundPlayback: true,
      },
    ],
    [
      'expo-splash-screen',
      {
        backgroundColor: '#050101',
        image: './assets/brand/logo-negative.png',
        imageWidth: 220,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    ...config.extra,
    firebaseNativeConfigured: Boolean(
      googleServicesFile || googleServiceInfoPlist,
    ),
    eas: {
      ...(config.extra?.eas ?? {}),
      projectId: '1ff31374-2489-46a3-a611-2113e37ea275',
    },
  },
});
