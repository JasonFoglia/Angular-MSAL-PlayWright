import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, provideRouter, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Subject, of } from 'rxjs';

// Import mocks before importing the component to avoid circular dependencies
import '../testing/mocks'; // Import the mock classes
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalModule, MsalService } from '@azure/msal-angular';
import { InteractionStatus, EventType } from '@azure/msal-browser';
import { AppComponent } from './app.component';
import { MockMsalBroadcastService, MockMsalService } from '../testing/mocks';

// Mock environment
jest.mock('../environments/environment', () => ({
  environment: {
    apiConfig: {
      uri: 'https://graph.microsoft.com/v1.0/me'
    }
  }
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let mockMsalService: MockMsalService;
  let mockMsalBroadcastService: MockMsalBroadcastService;
  let inProgressSubject: Subject<InteractionStatus>;
  let msalSubject: Subject<any>;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create fresh subjects for testing reactive behavior
    inProgressSubject = new Subject<InteractionStatus>();
    msalSubject = new Subject<any>();

    // Configure mock services with test-specific behavior
    mockMsalService = new MockMsalService();
    mockMsalService.handleRedirectObservable.mockReturnValue(of(null));

    mockMsalBroadcastService = new MockMsalBroadcastService();
    // Override the pipe method to provide controlled test subjects
    mockMsalBroadcastService.msalSubject$ = {
      pipe: jest.fn().mockReturnValue(msalSubject)
    };

    // Set up inProgress$ observable
    Object.defineProperty(mockMsalBroadcastService, 'inProgress$', {
      get: jest.fn().mockReturnValue(inProgressSubject)
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterOutlet,
        RouterLink,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            events: { subscribe: jest.fn() },
            createUrlTree: jest.fn(),
            serializeUrl: jest.fn()
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParams: {}, params: {} },
            queryParams: { subscribe: jest.fn() },
            params: { subscribe: jest.fn() }
          }
        },
        {
          provide: MsalService,
          useValue: mockMsalService
        },
        {
          provide: MsalBroadcastService,
          useValue: mockMsalBroadcastService
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: {
            authRequest: { scopes: ['user.read'] }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should handle account storage events in ngOnInit', () => {
    fixture.detectChanges();
    expect(mockMsalService.instance.enableAccountStorageEvents).toHaveBeenCalled();
  });

  it('should handle msal subject events for account changes', () => {
    fixture.detectChanges();

    // Simulate ACCOUNT_ADDED event
    const accountAddedEvent = { eventType: EventType.ACCOUNT_ADDED };
    msalSubject.next(accountAddedEvent);

    expect(mockMsalService.instance.getAllAccounts).toHaveBeenCalled();
  });

  it('should redirect to home when no accounts after event', () => {
    // Mock the window.location object
    const originalLocation = window.location;
    window.location = { ...originalLocation, pathname: '/profile' } as any;

    mockMsalService.instance.getAllAccounts.mockReturnValue([]);

    fixture.detectChanges();

    // Simulate ACCOUNT_REMOVED event
    const accountRemovedEvent = { eventType: EventType.ACCOUNT_REMOVED };
    msalSubject.next(accountRemovedEvent);

    expect(window.location.pathname).toBe('/');

    // Restore original location
    window.location = originalLocation as Location & string;
  });

  it('should update login display when accounts exist after event', () => {
    const mockAccount = { username: 'test@example.com' };
    mockMsalService.instance.getAllAccounts.mockReturnValue([mockAccount]);

    fixture.detectChanges();

    // Simulate ACQUIRE_TOKEN_SUCCESS event
    const tokenSuccessEvent = { eventType: EventType.ACQUIRE_TOKEN_SUCCESS };
    msalSubject.next(tokenSuccessEvent);

    expect(component.loginDisplay).toBe(true);
  });

  it('should react to InteractionStatus.None by setting display and checking accounts', () => {
    // Set up spy to track method calls
    const setLoginDisplaySpy = jest.spyOn(component, 'setLoginDisplay');
    const checkAccountSpy = jest.spyOn(component, 'checkAndSetActiveAccount');

    fixture.detectChanges();

    // Simulate interaction status change to None
    inProgressSubject.next(InteractionStatus.None);

    expect(setLoginDisplaySpy).toHaveBeenCalled();
    expect(checkAccountSpy).toHaveBeenCalled();
  });

  it('should call loginPopup with guard config when available', () => {
    const mockResponseAccount = { username: 'popup@example.com' };
    mockMsalService.loginPopup.mockReturnValue(of({ account: mockResponseAccount }));

    component.loginPopup();

    expect(mockMsalService.loginPopup).toHaveBeenCalledWith({ scopes: ['user.read'] });
    expect(mockMsalService.instance.setActiveAccount).toHaveBeenCalledWith(mockResponseAccount);
  });

  it('should properly clean up resources on destroy', () => {
    const nextSpy = jest.spyOn(component['_destroying$'], 'next');
    const completeSpy = jest.spyOn(component['_destroying$'], 'complete');

    component.ngOnDestroy();

    expect(nextSpy).toHaveBeenCalled();
    expect(completeSpy).toHaveBeenCalled();
  });
});

