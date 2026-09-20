import { TestBed } from '@angular/core/testing';

import { AuthDoomService } from './auth-doom.service';

describe('AuthDoomService', () => {
  let service: AuthDoomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthDoomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
