import { Component, OnInit } from '@angular/core';
import { MachineService } from '../../machine/machine.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Machine, Drive } from '../../machine/machine.model';
import { AlertPolicy } from '../alertpolicy.model';
import { AlertService } from '../alert.service';
import { Router } from '@angular/router';
import { SlackIntegration } from '../../integrations/integration.model';
import { IntegrationService } from '../../integrations/integration.service';


@Component({
  selector: 'app-new-disk-alert',
  templateUrl: './new-disk-alert.component.html',
  styleUrls: ['./new-disk-alert.component.css']
})

export class NewDiskAlertComponent implements OnInit {

  newDiskSpaceAlertForm: FormGroup;
  machines: Machine[];
  selectedMachine: Machine;
  selectedMachineId: String;
  constructor(
    private machineService: MachineService,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private integrationService: IntegrationService
  ) {
    this.newDiskSpaceAlertForm = this.formBuilder.group({
      'machineId': ['', [Validators.required]],
      'item': ['', [Validators.required]],
      'threshold': ['', [Validators.required]],
      'priority': ['', [Validators.required]],
      'integrations': ['']
    })
  }

  // onChange() {
  //   this.machineService.getMachineDrives(this.selectedMachineId)
  //     .subscribe((drives: DriveDetails) => this.drives = drives)
  // }

  ngOnInit() {
    // this.machineService.getAllMachines()
    //   .subscribe((machines: Array<Machine>) => this.machines = machines)
    // this.integrationService.getAllIntegrations()
    //   .subscribe((integrations: Array<SlackIntegration>) => this.integrations = integrations)
  }

  submitForm(newDiskSpaceAlert: AlertPolicy) {
    newDiskSpaceAlert.type = "drive";
    this.alertService.postAlertPolicy(newDiskSpaceAlert)
      .subscribe(newDiskSpaceAlert => {
        this.router.navigate(['alertpolicies/'])
      });
  }

}