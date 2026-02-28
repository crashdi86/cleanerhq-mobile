import { ExpoConfig, ConfigContext } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getAppName = (): string => {
  if (IS_DEV) return "CleanerHQ (Dev)";
  if (IS_PREVIEW) return "CleanerHQ (Preview)";
  return "CleanerHQ";
};

const getApiBaseUrl = (): string => {
  if (IS_PREVIEW) return "https://app.cleanerhq.com/api/v1/mobile";
  if (process.env.APP_VARIANT === "production")
    return "https://app.cleanerhq.com/api/v1/mobile";
  // Dev: use CORS proxy (port 3001) for web, direct for native
  return "http://localhost:3001/api/v1/mobile";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "cleanerhq-field",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  scheme: "cleanerhq",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#2A5B4F",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.cleanerhq.field",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
      backgroundColor: "#2A5B4F",
    },
    package: "com.cleanerhq.field",
  },
  web: {
    favicon: "./assets/favicon.png",
    bundler: "metro",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    "expo-image",
    "expo-web-browser",
    "expo-local-authentication",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow CleanerHQ to access your photos for profile pictures.",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "CleanerHQ needs your location for clock-in verification and route tracking.",
        locationWhenInUsePermission:
          "CleanerHQ needs your location for clock-in verification.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiBaseUrl: getApiBaseUrl(),
    eas: {
      projectId: "placeholder",
    },
  },
});
