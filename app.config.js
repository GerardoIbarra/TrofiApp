module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      router: {},
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      },
    },
    updates: {
      ...config.updates,
      url: process.env.EXPO_PUBLIC_PROJECT_URL,
    },
  };
};
