jest.mock('@azure/msal-angular', () => {
  const originalModule = jest.requireActual('@azure/msal-angular');
  return {
    __esModule: true,
    ...originalModule,
    MsalService: jest.fn(),
    MsalBroadcastService: jest.fn(),
    MSAL_GUARD_CONFIG: 'MSAL_GUARD_CONFIG'
  };
});

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MSAL_GUARD_CONFIG } from '@azure/msal-angular';
// Now it's safe to import the component
import { AppComponent } from './app.component';

describe('AppComponent', () => {

  const mockMsalService = {
    instance: {
      acquireTokenRedirect: jest.fn(),
      getActiveAccount: jest.fn(),
      setActiveAccount: jest.fn()
    },
    initialize: jest.fn(),
    loginRedirect: jest.fn(),
    logoutRedirect: jest.fn(),
    handleRedirectObservable: jest.fn().mockImplementation(() => ({
      subscribe: jest.fn()
    })),
    getAllAccounts: jest.fn().mockReturnValue([])
  };

  const mockMsalBroadcastService = {
    msalSubject$: {
      pipe: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      })
    },
    inProgress$: {
      pipe: jest.fn().mockReturnValue({
        subscribe: jest.fn()
      })
    }
  };

  beforeEach(async () => {
    Object.defineProperty(global, 'navigator', {
      value: {
        userAgent: 'node.js'
      },
      writable: true
    });

    await TestBed.configureTestingModule({
      imports: [
        MatToolbarModule,
        RouterLink,
        RouterOutlet
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: MSAL_GUARD_CONFIG,
          useValue: {
            authRequest: {}
          }
        },
        {
          provide: 'MsalService',
          useValue: mockMsalService
        },
        {
          provide: 'MsalBroadcastService',
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

  it(`should have the 'Angular-MSAL-PlayWright' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular-MSAL-PlayWright');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, Angular-MSAL-PlayWright');
  });
});
