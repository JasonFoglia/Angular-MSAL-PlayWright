import { mockMsalBroadcastService, mockMsalService } from 'src/testing/mocks';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, provideRouter, Router, RouterLink, RouterOutlet } from '@angular/router';
import { MSAL_GUARD_CONFIG, MsalBroadcastService, MsalModule, MsalService } from '@azure/msal-angular';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

// jest.mock('./app.component.html', () => '<h1>{{ title }}</h1>', { virtual: true });
// jest.mock('./app.component.scss', () => '', { virtual: true });

describe('AppComponent', () => {
  beforeEach(async () => {
    jest.clearAllMocks(); // Reset mocks between tests (Azure security best practice)

    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'node.js'
      },
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MsalModule,
        RouterOutlet,
        RouterLink,
        MatButtonModule,
        MatMenuModule,
        MatToolbarModule,

        AppComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        // provideNoopAnimations(),
        provideRouter([]),
        {
          provide: Router,
          useValue: {
            navigate: jest.fn(),
            events: {
              subscribe: jest.fn()
            }
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
              params: {}
            },
            queryParams: {
              subscribe: jest.fn()
            },
            params: {
              subscribe: jest.fn()
            }
          }
        },
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: {
            authRequest: { scopes: ['user.read'] }
          }
        },
        {
          provide: MsalService,
          useValue: mockMsalService
        },
        {
          provide: MsalBroadcastService,
          useValue: mockMsalBroadcastService
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have loginDisplay initialized to false', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.loginDisplay).toBe(false);
  });

  it(`should have the 'Angular MSAL PlayWright' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular MSAL PlayWright');
  });

  it('should call handleRedirectObservable during initialization', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(mockMsalService.handleRedirectObservable).toHaveBeenCalled();
  });

  it('should update loginDisplay based on accounts', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    // Test with no accounts
    mockMsalService.getAllAccounts.mockReturnValue([]);
    app.setLoginDisplay();
    expect(app.loginDisplay).toBe(false);

    // Test with accounts
    mockMsalService.getAllAccounts.mockReturnValue([{ username: 'test@example.com' }]);
    app.setLoginDisplay();
    expect(app.loginDisplay).toBe(true);
  });

  it('should set active account if none exists but accounts are available', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    mockMsalService.instance.getActiveAccount.mockReturnValue(null);
    mockMsalService.getAllAccounts.mockReturnValue([{ username: 'test@example.com' }]);

    app.checkAndSetActiveAccount();

    expect(mockMsalService.instance.setActiveAccount).toHaveBeenCalled();
  });

  it('should call loginRedirect with guard config when available', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    app.loginRedirect();

    expect(mockMsalService.loginRedirect).toHaveBeenCalledWith({
      scopes: ['user.read']
    });
  });

  it('should call logoutRedirect with the correct parameters', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockAccount = { username: 'test@example.com' };

    mockMsalService.getAllAccounts.mockReturnValue([mockAccount]);

    app.logout();

    expect(mockMsalService.logoutRedirect).toHaveBeenCalledWith({
      account: mockAccount
    });
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, Angular-MSAL-PlayWright');
  });
});
