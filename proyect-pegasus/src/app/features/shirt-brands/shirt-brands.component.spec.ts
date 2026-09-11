import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShirtBrandsComponent } from './shirt-brands.component';

describe('ShirtBrandsComponent', () => {
  let component: ShirtBrandsComponent;
  let fixture: ComponentFixture<ShirtBrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShirtBrandsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShirtBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
