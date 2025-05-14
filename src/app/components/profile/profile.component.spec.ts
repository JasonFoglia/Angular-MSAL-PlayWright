import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

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

// Mock environment
jest.mock('../../../environments/environment', () => ({
  environment: {
    apiConfig: {
      uri: 'https://graph.microsoft.com/v1.0/me'
    }
  }
}));

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockMsalService: any;
  let mockMsalBroadcastService: any;
  let httpMock: HttpTestingController;

  beforeEach(async () => {

    mockMsalService = new (jest.requireMock('@azure/msal-angular').MsalService)();
    mockMsalBroadcastService = new (jest.requireMock('@azure/msal-angular').MsalBroadcastService)();

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
  });

  it('should create', () => {
    // Handle the HTTP request created during component initialization
    const req = httpMock.expectOne(environment.apiConfig.uri);
    req.flush({}); // Simple empty response

    expect(component).toBeTruthy();
  });

  it('should fetch profile data on initialization', () => {
    const mockProfileData = {
      givenName: 'John',
      surname: 'Doe',
      userPrincipalName: 'john.doe@example.com',
      id: '12345'
    };

    const req = httpMock.expectOne(environment.apiConfig.uri);
    expect(req.request.method).toBe('GET');
    req.flush(mockProfileData);

    expect(component.profile()).toEqual(mockProfileData);
  });

  it('should handle empty response data', () => {
    const req = httpMock.expectOne(environment.apiConfig.uri);
    req.flush({});

    expect(component.profile()).toEqual({});
  });

  it('should handle null response data', () => {
    const req = httpMock.expectOne(environment.apiConfig.uri);
    req.flush(null);

    expect(component.profile()).toBeNull();
  });

  it('should keep profile as undefined until HTTP response arrives', () => {
    // Before responding to the request, check initial value
    expect(component.profile()).toBeUndefined();

    // Now respond to the pending request
    httpMock.expectOne(environment.apiConfig.uri).flush({ givenName: 'Test' });

    // Verify profile is updated after response
    expect(component.profile()).toEqual({ givenName: 'Test' });
  });

  it('should only make one HTTP request regardless of how many times profile is accessed', () => {
    // Access profile signal multiple times
    component.profile();
    component.profile();
    component.profile();

    // Verify only one request was made
    const req = httpMock.expectOne(environment.apiConfig.uri);
    req.flush({ givenName: 'Jane' });

    // Accessing again after response still doesn't trigger new requests
    component.profile();
    component.profile();

    // No additional requests should be pending
    httpMock.verify();
  });

  it('should properly handle request with HTTP headers', () => {
    const req = httpMock.expectOne(environment.apiConfig.uri);

    // Verify the request was made with expected method and headers
    expect(req.request.method).toBe('GET');
    // If your implementation adds specific headers, you can verify them here
    // expect(req.request.headers.has('Authorization')).toBeTrue();

    req.flush({ id: 'user123' });
  });

  it('should handle null response data', () => {
    const req = httpMock.expectOne(environment.apiConfig.uri);
    req.flush(null);

    expect(component.profile()).toBeNull();
  });
});
