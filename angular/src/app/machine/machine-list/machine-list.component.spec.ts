import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachinelistComponent } from './machine-list.component';

describe('MachinelistComponent', () => {
  let component: MachinelistComponent;
  let fixture: ComponentFixture<MachinelistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachinelistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachinelistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
