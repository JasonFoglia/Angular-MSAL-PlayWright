jest.mock('@azure/msal-angular', () => ({
  MSAL_GUARD_CONFIG: Symbol('msal-guard-config'),
  MsalService: class MockMsalService {
    instance = {
      acquireTokenRedirect: jest.fn(),
      getActiveAccount: jest.fn(),
      setActiveAccount: jest.fn(),
      enableAccountStorageEvents: jest.fn(),
      getAllAccounts: jest.fn().mockReturnValue([]),

      initialize: jest.fn(),
      acquireTokenPopup: jest.fn(),

      acquireTokenSilent: jest.fn(),
      acquireTok: jest.fn(),
      addEventCallback: jest.fn(),
      removeEventCallback: jest.fn(),
      addPerformanceCallback: jest.fn(),
      removePerformanceCallback: jest.fn(),

      disableAccountStorageEvents: jest.fn(),
      getAccount: jest.fn(),
      getAccountByHomeId: jest.fn(),
      getAccountByLocalId: jest.fn(),
      getAccountByUsername: jest.fn(),

      handleRedirectPromise: jest.fn(),
      loginPopup: jest.fn(),
      loginRedirect: jest.fn(),
      logout: jest.fn(),
      logoutRedirect: jest.fn(),
      logoutPopup: jest.fn(),
      ssoSilent: jest.fn(),
      getTokenCache: jest.fn(),
      getLogger: jest.fn(),
      setLogger: jest.fn(),

      initializeWrapperLibrary: jest.fn(),
      setNavigationClient: jest.fn(),

      // getConfiguration
      // hydrateCache
    };
    initialize = jest.fn();
    loginRedirect = jest.fn();
    logoutRedirect = jest.fn();
    handleRedirectObservable = jest.fn().mockReturnValue({
      subscribe: jest.fn()
    });
    getAllAccounts = jest.fn().mockReturnValue([]);

    acquireTokenPopup = jest.fn();
    acquireTokenRedirect = jest.fn();
    acquireTokenSilent = jest.fn();
    loginPopup = jest.fn();
    logout = jest.fn();
    logoutPopup = jest.fn();
    ssoSilent = jest.fn();
    getLogger = jest.fn();
    setLogger = jest.fn();
  },
  MsalBroadcastService: class MockMsalBroadcastService {
    msalSubject$ = { pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }) };
    inProgress$ = { pipe: jest.fn().mockReturnValue({ subscribe: jest.fn() }) };
  },
}));


export const mockMsalService = {
  instance: {
    acquireTokenRedirect: jest.fn(),
    getActiveAccount: jest.fn(),
    setActiveAccount: jest.fn(),
    enableAccountStorageEvents: jest.fn(),
    getAllAccounts: jest.fn().mockReturnValue([]),

    initialize: jest.fn(),
    acquireTokenPopup: jest.fn(),

    acquireTokenSilent: jest.fn(),
    acquireTok: jest.fn(),
    addEventCallback: jest.fn(),
    removeEventCallback: jest.fn(),
    addPerformanceCallback: jest.fn(),
    removePerformanceCallback: jest.fn(),

    disableAccountStorageEvents: jest.fn(),
    getAccount: jest.fn(),
    getAccountByHomeId: jest.fn(),
    getAccountByLocalId: jest.fn(),
    getAccountByUsername: jest.fn(),

    handleRedirectPromise: jest.fn(),
    loginPopup: jest.fn(),
    loginRedirect: jest.fn(),
    logout: jest.fn(),
    logoutRedirect: jest.fn(),
    logoutPopup: jest.fn(),
    ssoSilent: jest.fn(),
    getTokenCache: jest.fn(),
    getLogger: jest.fn(),
    setLogger: jest.fn(),

    initializeWrapperLibrary: jest.fn(),
    setNavigationClient: jest.fn(),

    // getConfiguration
    // hydrateCache
  },
  initialize: jest.fn(),
  loginRedirect: jest.fn(),
  logoutRedirect: jest.fn(),
  handleRedirectObservable: jest.fn().mockReturnValue({
    subscribe: jest.fn()
  }),
  getAllAccounts: jest.fn().mockReturnValue([]),

  acquireTokenPopup: jest.fn(),
  acquireTokenRedirect: jest.fn(),
  acquireTokenSilent: jest.fn(),
  loginPopup: jest.fn(),
  logout: jest.fn(),
  logoutPopup: jest.fn(),
  ssoSilent: jest.fn(),
  getLogger: jest.fn(),
  setLogger: jest.fn(),
};

export const mockMsalBroadcastService = {
  msalSubject$: {
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn((callback) => callback({ eventType: 'ACCOUNT_ADDED' }))
    })
  },
  inProgress$: {
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn((callback) => callback('none'))
    })
  }
};
