import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemLinkStepComponent } from './item-link-step.component';

describe('ItemLinkStepComponent', () => {
  let component: ItemLinkStepComponent;
  let fixture: ComponentFixture<ItemLinkStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ItemLinkStepComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItemLinkStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
