import { TestBed } from '@angular/core/testing';

import { DataConvertService } from './data-convert.service';

describe('DataConvertService', () => {
  let service: DataConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
