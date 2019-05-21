import { Component, OnInit } from '@angular/core';
import { MachineService } from '../../machine/machine.service';
import { AlertService } from '../alert.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Machine } from '../../machine/machine.model';
import { AlertPolicy } from '../alertpolicy.model';

@Component({
  selector: 'app-new-alert-policy',
  templateUrl: './new-alert-policy.component.html',
  styleUrls: ['./new-alert-policy.component.css']
})

export class NewAlertPolicyComponent implements OnInit {

  newAlertPolicyForm: FormGroup;
  machines: Machine[]
  selectedMachine: Machine;
  selectedMachineId: String;

  types: any[] = [
    {value: 'Drive', viewValue: 'Drive'},
    {value: 'Service', viewValue: 'Service'},
    {value: 'Process', viewValue: 'Process'}
  ];

  priorites: any[] = [
    {value: 'Low', viewValue: 'Low'},
    {value: 'Medium', viewValue: 'Medium'},
    {value: 'High', viewValue: 'High'},
    {value: 'Urgent', viewValue: 'Urgent'}
  ];

  drives: any[] = [
    {value: 'A', viewValue: 'A'},
    {value: 'B', viewValue: 'B'},
    {value: 'C', viewValue: 'C'},
    {value: 'D', viewValue: 'D'},
    {value: 'E', viewValue: 'E'},
    {value: 'F', viewValue: 'F'},
    {value: 'G', viewValue: 'G'},
    {value: 'H', viewValue: 'H'},
    {value: 'I', viewValue: 'I'},
    {value: 'J', viewValue: 'J'},
    {value: 'K', viewValue: 'K'},
    {value: 'L', viewValue: 'L'},
    {value: 'M', viewValue: 'M'},
    {value: 'N', viewValue: 'N'},
    {value: 'O', viewValue: 'O'},
    {value: 'P', viewValue: 'P'},
    {value: 'Q', viewValue: 'Q'},
    {value: 'R', viewValue: 'R'},
    {value: 'S', viewValue: 'S'},
    {value: 'T', viewValue: 'T'},
    {value: 'U', viewValue: 'U'},
    {value: 'V', viewValue: 'V'},
    {value: 'W', viewValue: 'W'},
    {value: 'X', viewValue: 'X'},
    {value: 'Y', viewValue: 'Y'},
    {value: 'Z', viewValue: 'Z'} 
  ];


  constructor(
    private machineService: MachineService,
    private alertService: AlertService,
    private router: Router,
    private formBuilder: FormBuilder,
  ) {

    this.newAlertPolicyForm = this.formBuilder.group({
      'machine': ['', [Validators.required]],
      'type': ['', [Validators.required]],
      'item': ['', [Validators.required]],
      'priority': ['', [Validators.required]],
      'threshold': ['', []]
    })

  }

  ngOnInit() {
    this.machineService.getAllMachines()
      .subscribe((machines: Array<Machine>) => this.machines = machines)
      this.setThresholdValidators()
  }

  setThresholdValidators() {
    const thresholdControl = this.newAlertPolicyForm.get('threshold');
    this.newAlertPolicyForm.get('type').valueChanges
      .subscribe(type => {
        if (type == 'Drive') {
          thresholdControl.setValidators([Validators.required]);
        } else if (type != 'Drive'){
          thresholdControl.setValidators(null);
        }
        thresholdControl.updateValueAndValidity();
      });
  }

  submitForm(newAlertPolicyForm) {
    console.log(newAlertPolicyForm)
    this.alertService.postAlertPolicy(newAlertPolicyForm)
      .subscribe(alertPolicy => {
        this.router.navigate(['main/alertpolicies/' + alertPolicy._id])
      });
  }
}