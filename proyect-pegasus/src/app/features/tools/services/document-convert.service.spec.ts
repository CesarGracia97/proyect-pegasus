import { TestBed } from '@angular/core/testing';

import { DocumentConvertService } from './document-convert.service';

describe('DocumentConvertService', () => {
  let service: DocumentConvertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentConvertService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
