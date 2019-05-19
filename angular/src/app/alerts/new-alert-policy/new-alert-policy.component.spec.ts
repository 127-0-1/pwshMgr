import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAlertPolicyComponent } from './new-alert-policy.component';

describe('NewAlertPolicyComponent', () => {
  let component: NewAlertPolicyComponent;
  let fixture: ComponentFixture<NewAlertPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAlertPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAlertPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
