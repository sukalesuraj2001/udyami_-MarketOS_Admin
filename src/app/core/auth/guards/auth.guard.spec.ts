import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../auth.store';
import { AppRole } from '../models/user.model';

describe('authGuard', () => {
  let store: AuthStore;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('URL_TREE') } }],
    });
    store = TestBed.inject(AuthStore);
    router = TestBed.inject(Router);
  });

  function run() {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as unknown as ActivatedRouteSnapshot, { url: '/admin/tenants' } as unknown as RouterStateSnapshot),
    );
  }

  it('allows navigation when authenticated', () => {
    store.setSession({
      success: true,
      message: 'Login successful.',
      accessToken: 'a',
      testMode: false,
      user: {
        userId: 'u1',
        name: 'Yogesh',
        email: 'yogesh@jyovix.in',
        mobileNumber: '9999999999',
        businessLocation: null,
        officeLocation: null,
        latitude: '0',
        longitude: '0',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userRoles: [],
        isBasic: false,
        isPrime: false,
        isPatron: false,
        otp: '0000',
        hasBusiness: false,
        memberId: null,
        cpId: null,
        isTrial: false,
        role: AppRole.SuperAdmin,
        roles: [AppRole.SuperAdmin],
        position: {
          positionHolderId: 'p1',
          positionId: 'p1',
          positionName: 'Admin',
          permission: 'READ_ONLY',
          assignedBy: 'u1',
          assignedByUser: { userId: 'u1', firstName: 'Yogesh', mobileNumber: '9999999999', email: 'yogesh@jyovix.in' },
        },
      },
    });
    expect(run()).toBe(true);
  });

  it('redirects to /login with the attempted URL when not authenticated', () => {
    const result = run();
    expect(result).toEqual('URL_TREE' as never);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], { queryParams: { redirectTo: '/admin/tenants' } });
  });
});
