import { TestBed } from '@angular/core/testing';

import { YtConvertService } from './yt-convert.service';

describe('YtConvertService', () => {
  let service: YtConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(YtConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
