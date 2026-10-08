import { TestBed } from '@angular/core/testing';

import { ImageConvertService } from './image-convert.service';

describe('ImageConvertService', () => {
  let service: ImageConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
