import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentConvertComponent } from './document-convert.component';

describe('DocumentConvertComponent', () => {
  let component: DocumentConvertComponent;
  let fixture: ComponentFixture<DocumentConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentConvertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
