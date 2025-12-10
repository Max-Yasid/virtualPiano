import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperBackground } from './paper-background';

describe('PaperBackground', () => {
  let component: PaperBackground;
  let fixture: ComponentFixture<PaperBackground>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaperBackground]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaperBackground);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
