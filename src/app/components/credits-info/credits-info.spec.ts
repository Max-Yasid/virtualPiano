import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditsInfo } from './credits-info';

describe('CreditsInfo', () => {
  let component: CreditsInfo;
  let fixture: ComponentFixture<CreditsInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditsInfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditsInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
