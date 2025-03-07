import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSectionComponent } from './bottom-section.component';

describe('BottomSectionComponent', () => {
  let component: BottomSectionComponent;
  let fixture: ComponentFixture<BottomSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
