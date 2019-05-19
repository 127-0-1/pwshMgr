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
    {value: 'Service', viewValue: 'Process'}
  ];

  priorites: any[] = [
    {value: 'Low', viewValue: 'Low'},
    {value: 'Medium', viewValue: 'Medium'},
    {value: 'High', viewValue: 'High'},
    {value: 'Urgent', viewValue: 'Urgent'}
  ];

  drives: any[] = [
    {value: 'a', viewValue: 'A'},
    {value: 'b', viewValue: 'B'},
    {value: 'c', viewValue: 'C'},
    {value: 'd', viewValue: 'D'},
    {value: 'e', viewValue: 'E'},
    {value: 'f', viewValue: 'F'},
    {value: 'g', viewValue: 'G'},
    {value: 'h', viewValue: 'H'},
    {value: 'i', viewValue: 'I'},
    {value: 'j', viewValue: 'J'},
    {value: 'k', viewValue: 'K'},
    {value: 'l', viewValue: 'L'},
    {value: 'm', viewValue: 'M'},
    {value: 'n', viewValue: 'N'},
    {value: 'o', viewValue: 'O'},
    {value: 'p', viewValue: 'P'},
    {value: 'q', viewValue: 'Q'},
    {value: 'r', viewValue: 'R'},
    {value: 's', viewValue: 'S'},
    {value: 't', viewValue: 'T'},
    {value: 'u', viewValue: 'U'},
    {value: 'v', viewValue: 'V'},
    {value: 'w', viewValue: 'W'},
    {value: 'x', viewValue: 'X'},
    {value: 'y', viewValue: 'Y'},
    {value: 'z', viewValue: 'Z'} 
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