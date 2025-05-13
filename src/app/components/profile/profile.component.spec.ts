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
  MsalModule: {
    forRoot: jest.fn(),
  },
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { provideHttpClient } from '@angular/common/http';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalModule, MsalService } from '@azure/msal-angular';
import { CommonModule } from '@angular/common';

fdescribe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockMsalService: any;
  let mockMsalBroadcastService: any;

  beforeEach(async () => {
    mockMsalService = new (jest.requireMock('@azure/msal-angular').MsalService)();
    mockMsalBroadcastService = new (jest.requireMock('@azure/msal-angular').MsalBroadcastService)();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ProfileComponent,

        jest.requireMock('@azure/msal-angular').MsalModule,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: MsalService,
          useValue: mockMsalService,
        },
        {
          provide: MsalBroadcastService,
          useValue: mockMsalBroadcastService,
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: {
            authRequest: { scopes: ['user.read'] },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
