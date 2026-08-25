import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioConvertComponent } from './audio-convert.component';

describe('AudioConvertComponent', () => {
  let component: AudioConvertComponent;
  let fixture: ComponentFixture<AudioConvertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AudioConvertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioConvertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
