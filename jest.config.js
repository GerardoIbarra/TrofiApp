module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules[\\\\/](?!.*(@expo|expo-modules-core|expo|react-native|@react-native|zustand|lucide-react-native|@react-navigation|react-navigation)[\\\\/])',
  ],
};
