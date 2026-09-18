import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataConvertComponent } from './data-convert.component';

describe('DataConvertComponent', () => {
  let component: DataConvertComponent;
  let fixture: ComponentFixture<DataConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataConvertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
