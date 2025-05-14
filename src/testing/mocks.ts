Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});
/**
 * ISSUE: https://github.com/angular/material2/issues/7101
 * Workaround for JSDOM missing transform property
 */
Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

// Define the mock MSAL instance once
export const msalInstance = {
  acquireTokenRedirect: jest.fn(),
  getActiveAccount: jest.fn(),
  setActiveAccount: jest.fn(),
  enableAccountStorageEvents: jest.fn(),
  getAllAccounts: jest.fn().mockReturnValue([]),
  initialize: jest.fn(),
  acquireTokenPopup: jest.fn(),
  acquireTokenSilent: jest.fn(),
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
};

// Define mock classes
export class MockMsalService {
  instance = msalInstance;
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
}

export class MockMsalBroadcastService {
  msalSubject$ = {
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn((callback) => callback({ eventType: 'ACCOUNT_ADDED' }))
    })
  };
  inProgress$ = {
    pipe: jest.fn().mockReturnValue({
      subscribe: jest.fn((callback) => callback('none'))
    })
  };
}

export class MockMsalGuard {
  // Add mock implementations for canActivate, canActivateChild, canLoad if needed
  canActivate = jest.fn().mockReturnValue(true); // Example
  canActivateChild = jest.fn().mockReturnValue(true); // Example
  canLoad = jest.fn().mockReturnValue(true); // Example
}


// Export instance versions for direct usage in tests
export const mockMsalService = new MockMsalService();
export const mockMsalBroadcastService = new MockMsalBroadcastService();

// Set up the jest mock (single implementation)
jest.mock('@azure/msal-angular', () => {
  const MSAL_GUARD_CONFIG = Symbol('msal-guard-config');
  const MSAL_INSTANCE = Symbol('msal-instance');
  const MSAL_INTERCEPTOR_CONFIG = Symbol('msal-interceptor-config');

  return {
    MSAL_GUARD_CONFIG,
    MSAL_INSTANCE,
    MSAL_INTERCEPTOR_CONFIG,
    MsalService: MockMsalService,
    MsalBroadcastService: MockMsalBroadcastService,
    MsalGuard: MockMsalGuard,
    MsalModule: {
      forRoot: () => ({
        ngModule: class { },
        providers: [
          {
            provide: MSAL_INSTANCE,
            useValue: msalInstance,
          },
          {
            provide: MSAL_GUARD_CONFIG,
            useValue: {
              authRequest: { scopes: ['user.read'] },
            }
          },
          {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useValue: {
              interactionType: 'redirect',
              protectedResourceMap: new Map([
                ['https://graph.microsoft.com/v1.0/me', ['user.read']]
              ]),
            },
          },
          {
            provide: MockMsalService,
            useClass: MockMsalService,
          },
        ],
      }),
    },
  };
});
