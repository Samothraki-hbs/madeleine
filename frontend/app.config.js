export default ({ config }) => ({
  ...config,
  expo: {
    ...config.expo,
    name: "frontend",
    slug: "frontend",
    owner: "samothraki-hbs",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      ...config.expo?.ios,
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.frontend",
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      ...config.expo?.android,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.frontend",
      googleServicesFile: "./google-services.json",
      jsEngine: "hermes",
    },
    web: {
      ...config.expo?.web,
      bundler: "metro",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      ...config.expo?.extra,
      eas: {
        projectId: "12b8ddfc-47af-4e90-bc3c-6d1eb9a4c1a3"
      }
    }
    // Ajoute ici d'autres champs si EAS te le demande (owner, etc.)
  }
});
