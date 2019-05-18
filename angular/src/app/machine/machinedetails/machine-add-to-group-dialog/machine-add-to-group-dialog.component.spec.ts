import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineAddToGroupDialogComponent } from './machine-add-to-group-dialog.component';

describe('MachineAddToGroupDialogComponent', () => {
  let component: MachineAddToGroupDialogComponent;
  let fixture: ComponentFixture<MachineAddToGroupDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MachineAddToGroupDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineAddToGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
