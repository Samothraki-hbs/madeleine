export default {
  expo: {
    name: "frontend",
    slug: "frontend",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "frontend",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.frontend"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.frontend"
    },
    web: {
      bundler: "metro",
      favicon: "./assets/images/favicon.png"
    },
    extra: {
      eas: {
        projectId: "da313183-c107-482d-84c4-679ec5af3c31"
      }
    }
    // Ajoute ici d'autres champs si EAS te le demande (owner, extra, etc.)
  }
};
