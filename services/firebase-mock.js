/**
 * Mock de Firebase para entornos sin módulos nativos (Expo Go / pruebas JS).
 * En un build nativo real con google-services.json, los módulos reales toman el control.
 */
const noOp = () => {};
const noOpAsync = async () => {};

const messagingMock = () => ({
  requestPermission: noOpAsync,
  getToken: async () => null,
  deleteToken: noOpAsync,
  onMessage: () => noOp,
  onNotificationOpenedApp: noOp,
  getInitialNotification: async () => null,
  onTokenRefresh: noOp,
});

messagingMock.AuthorizationStatus = {
  AUTHORIZED: 1,
  PROVISIONAL: 2,
  NOT_DETERMINED: 0,
  DENIED: -1,
};

const appMock = {
  apps: [],
  initializeApp: noOp,
  app: () => ({}),
};

module.exports = messagingMock;
module.exports.default = messagingMock;
module.exports.firebase = appMock;
