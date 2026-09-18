import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YtConvertComponent } from './yt-convert.component';

describe('YtConvertComponent', () => {
  let component: YtConvertComponent;
  let fixture: ComponentFixture<YtConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YtConvertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YtConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
