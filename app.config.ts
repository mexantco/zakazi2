import { type ExpoConfig } from "@expo/config-types";
import { withAppDelegate, type ConfigPlugin } from "expo/config-plugins";

const config: ExpoConfig = {
      plugins: [
        [
          "expo-barcode-scanner",
          {
            cameraPermission: "Allow $(PRODUCT_NAME) to access camera."
          }
        ],
        [
          "@maplibre/maplibre-react-native"
        ],
        [
          "expo-image-picker",
          {
            photosPermission: "The app accesses your photos to let you share them with your friends."
          }
        ],
        [
          "expo-location",
          {
            locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
          }
        ],
         "expo-font"
      ],
      name: "zakazi",
      updates: {
        url: "https://u.expo.dev/083f521f-5ccd-4060-968f-710eed00edc7"
      },
      slug: "zakazi",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      assetBundlePatterns: [
        "**/*"
      ],
      ios: {
        runtimeVersion:{
          policy:'appVersion'
        },
        supportsTablet: true,
        infoPlist: {
          NSCameraUsageDescription: "Allow $(PRODUCT_NAME) to access camera.",
          NSMicrophoneUsageDescription: "Allow $(PRODUCT_NAME) to access your microphone"
        },
        bundleIdentifier: "com.mexantco.zakazi"
      },
      android: {
        runtimeVersion:'1.0.0',
        googleServicesFile: "./android/app/google-services.json",
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#ffffff"
        },
        package: "com.mexantco.zakazi",
        permissions: [
          "android.permission.CAMERA",
        ]
      },
        extra: {
          eas: {
            projectId: "083f521f-5ccd-4060-968f-710eed00edc7"
          },
            mapKitApiKey: "00559dcf-3b1e-4e95-9930-56c2b447888d",
            
        },
};

const withYandexMaps: ConfigPlugin = (config) => {
  return withAppDelegate(config, async (config) => {
    const appDelegate = config.modResults;

    // Add import
    if (!appDelegate.contents.includes("#import <YandexMapsMobile/YMKMapKitFactory.h>")) {
      // Replace the first line with the intercom import
      appDelegate.contents = appDelegate.contents.replace(
        /#import "AppDelegate.h"/g,
        `#import "AppDelegate.h"\n#import <YandexMapsMobile/YMKMapKitFactory.h>`
      );
    }

    const mapKitMethodInvocations = [
      `[YMKMapKit setApiKey:@"00559dcf-3b1e-4e95-9930-56c2b447888d"];`,
      `[YMKMapKit setLocale:@"ru_RU"];`,
      `[YMKMapKit mapKit];`,
    ]
      .map((line) => `\t${line}`)
      .join("\n");

    // Add invocation
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!appDelegate.contents.includes(mapKitMethodInvocations)) {
      appDelegate.contents = appDelegate.contents.replace(
        /\s+return YES;/g,
        `\n\n${mapKitMethodInvocations}\n\n\treturn YES;`
      );
    }

    return config;
  });
};

export default withYandexMaps(config);
