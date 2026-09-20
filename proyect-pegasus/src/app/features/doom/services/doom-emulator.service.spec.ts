import { TestBed } from '@angular/core/testing';

import { DoomEmulatorService } from './doom-emulator.service';

describe('DoomEmulatorService', () => {
  let service: DoomEmulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DoomEmulatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
