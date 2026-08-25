import { TestBed } from '@angular/core/testing';

import { VideoConvertService } from './video-convert.service';

describe('VideoConvertService', () => {
  let service: VideoConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
