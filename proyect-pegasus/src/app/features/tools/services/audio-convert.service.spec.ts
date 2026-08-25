import { TestBed } from '@angular/core/testing';

import { AudioConvertService } from './audio-convert.service';

describe('AudioConvertService', () => {
  let service: AudioConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
