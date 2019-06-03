import { Component, OnInit, TemplateRef, OnDestroy, Inject } from '@angular/core';
import { MachineService } from '../machine.service';
import { Machine, Application, Process, Drive, Service } from '../machine.model';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as io from 'socket.io-client';
import { JobService } from '../../jobs/jobs.service';
import { Alert } from '../../alerts/alert.model';
import { GroupService } from 'src/app/group/group.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { MachineAddToGroupDialogComponent } from './machine-add-to-group-dialog/machine-add-to-group-dialog.component';
import { Group } from 'src/app/group/group.model';
import { AlertService } from 'src/app/alerts/alert.service';
import { AlertPolicyView } from 'src/app/alerts/alertpolicy.model';
import { Job, NewJob } from 'src/app/jobs/job.model';
import { ScriptService } from 'src/app/script/script.service';
import { Script } from 'src/app/script/script.model';

export interface DialogData {
  machineId: string
}


@Component({
  selector: 'app-machine-details',
  templateUrl: './machine-details.component.html',
  styleUrls: ['./machine-details.component.css']
})
export class MachinedetailsComponent implements OnInit, OnDestroy {

  socket: SocketIOClient.Socket
  deployForm: FormGroup;
  machine: Machine;
  id: string;
  active = false;
  applications: Application[]
  processes: Process[]
  drives: Drive[]
  services: Service[]
  refreshing: string;
  groups: Group[]
  jobs: Job[];
  alertPolicies: AlertPolicyView[];
  alerts: Alert[];
  option: String

  applicationDisplayedColumns: string[] = ['name', 'version'];
  processDisplayedColumns: string[] = ['name', 'pId'];
  serviceDisplayedColumns: string[] = ['displayName', 'status'];
  driveDisplayedColumns: string[] = ['name', 'usedGb', 'freeGb'];
  groupDisplayedColumns: string[] = ['name', 'actions'];
  alertDisplayedColumns: string[] = ['name', 'priority'];
  alertPoliciesDisplayedColumns: string[] = ['name', 'priority'];
  jobDisplayedColumns: string[] = ['script.name', 'status', 'dateAdded'];
  constructor(
    private machineService: MachineService,
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private alertService: AlertService,
    private jobService: JobService,
    private dialog: MatDialog
  ) {
    // this.socket = io.connect("http://localhost:8080")
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.machineService.getMachineById(this.id)
      .subscribe(machine => {
        this.machine = machine
      });
    // this.socket.emit('room', this.id)
    // this.socket.on('machineUpdate', (machine: Machine) => {
    //   console.log("received update")
    //   this.machine = machine
    // })
  }

  deleteMachine() {
    if (confirm("Are you sure to delete?")) {
      this.machineService.deleteMachine(this.machine._id)
        .subscribe()
      this.router.navigate(['main/machines'])
    }
  }

  removeGroup(group) {
    console.log(group._id)
    this.groupService.deleteMachineFromGroup(group._id, this.id).subscribe(result => {
      this.groupService.getSingleMachineGroups(this.id).subscribe(groups => {
        this.groups = groups
      })
    })

  }

  addToGroup() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.data = { machineId: this.id }
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px'
    dialogConfig.height = '300px'
    dialogConfig.position = { top: '10%' }
    this.dialog.open(MachineAddToGroupDialogComponent, dialogConfig);
  }


  startMaintenance() {
    this.machine.status = "Maintenance"
    this.machineService.updateMachine(this.machine)
      .subscribe()
  }

  tabClick(tab) {
    if (tab.tab.textLabel == "Groups") {
      this.groupService.getSingleMachineGroups(this.id).subscribe(groups => {
        this.groups = groups
      })
    }
    if (tab.tab.textLabel == "Alerts") {
      this.alertService.getSingleMachineAlerts(this.id).subscribe(alerts => {
        this.alerts = alerts
      })
    }
    if (tab.tab.textLabel == "Alert Policies") {
      this.alertService.getSingleMachineAlertPolicies(this.id).subscribe(alertPolicies => {
        this.alertPolicies = alertPolicies
      })
    }
    if (tab.tab.textLabel == "Jobs") {
      this.jobService.getSingleMachineJobs(this.id).subscribe(jobs => {
        this.jobs = jobs
      })
    }
    if (tab.tab.textLabel == "Applications") {
      this.option = "applications"
      
      this.machineService.getMachineSpecificItems(this.id,this.option ).subscribe(applications => {
        this.applications = applications.applications
        console.log(applications)
      })
    }
    if (tab.tab.textLabel == "Drives") {
      this.option = "drives"
      
      this.machineService.getMachineSpecificItems(this.id,this.option ).subscribe(drives => {
        this.drives = drives.drives
        console.log(drives)
      })
    }
    if (tab.tab.textLabel == "Services") {
      this.option = "services"
      this.machineService.getMachineSpecificItems(this.id,this.option ).subscribe(services => {
        this.services = services.services
        console.log(services)
      })
    }
    if (tab.tab.textLabel == "Processes") {
      this.option = "processes"
      this.machineService.getMachineSpecificItems(this.id,this.option ).subscribe(processes => {
        this.processes = processes.processes
        console.log(processes)
      })
    }
  }

  stopMaintenance() {
    this.machine.status = "Pending Poll"
    this.machineService.updateMachine(this.machine)
      .subscribe()
  }

  ngOnDestroy() {
    // this.socket.disconnect()
    // console.log("disconneted socket")
  }

  runJob(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.data = { machineId: this.id }
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px'
    dialogConfig.height = '300px'
    dialogConfig.position = { top: '10%' }
    this.dialog.open(RunJobDialog, dialogConfig);
  }

  newAlertPolicy(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px'
    dialogConfig.height = '600px'
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: '5%' }
    this.dialog.open(NewAlertPolicyDialog, dialogConfig);
  }



}

@Component({
  selector: 'run-job-dialog',
  templateUrl: 'run-job-dialog.html',
  styleUrls: ['./run-job-dialog.css']
})
export class RunJobDialog implements OnInit {

  scripts: Script[]
  newJobForm: FormGroup

  constructor(
    public dialogRef: MatDialogRef<RunJobDialog>,
    private scriptService: ScriptService,
    private formBuilder: FormBuilder,
    private jobService: JobService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.newJobForm = this.formBuilder.group({
      'script': ['', [Validators.required]]
    })
  }

  ngOnInit() {
    this.scriptService.getAllScripts().subscribe(scripts => {
      this.scripts = scripts
      console.log(this.scripts)
    })
  }

  submitForm(newJob: NewJob) {
    newJob.machine = this.data.machineId
    console.log(newJob)
    this.jobService.postJob(newJob).subscribe(() => {
      this.dialogRef.close()
    })
  }
}


@Component({
  selector: 'new-alert-policy-dialog',
  templateUrl: 'new-alert-policy-dialog.html',
  styleUrls: ['./new-alert-policy-dialog.css']
})
export class NewAlertPolicyDialog implements OnInit {

  newAlertPolicyForm: FormGroup;
  machines: Machine[];
  selectedMachine: Machine;
  selectedMachineId: String;
  groups: Group[];

  types: any[] = [
    { value: 'Drive', viewValue: 'Drive' },
    { value: 'Service', viewValue: 'Service' },
    { value: 'Process', viewValue: 'Process' }
  ];

  assignmentTypes: any[] = [
    { value: 'Group', viewValue: 'Group' },
    { value: 'Machine', viewValue: 'Machine' }
  ]

  priorites: any[] = [
    { value: 'Low', viewValue: 'Low' },
    { value: 'Medium', viewValue: 'Medium' },
    { value: 'High', viewValue: 'High' },
    { value: 'Urgent', viewValue: 'Urgent' }
  ];

  drives: any[] = [
    { value: 'A', viewValue: 'A' },
    { value: 'B', viewValue: 'B' },
    { value: 'C', viewValue: 'C' },
    { value: 'D', viewValue: 'D' },
    { value: 'E', viewValue: 'E' },
    { value: 'F', viewValue: 'F' },
    { value: 'G', viewValue: 'G' },
    { value: 'H', viewValue: 'H' },
    { value: 'I', viewValue: 'I' },
    { value: 'J', viewValue: 'J' },
    { value: 'K', viewValue: 'K' },
    { value: 'L', viewValue: 'L' },
    { value: 'M', viewValue: 'M' },
    { value: 'N', viewValue: 'N' },
    { value: 'O', viewValue: 'O' },
    { value: 'P', viewValue: 'P' },
    { value: 'Q', viewValue: 'Q' },
    { value: 'R', viewValue: 'R' },
    { value: 'S', viewValue: 'S' },
    { value: 'T', viewValue: 'T' },
    { value: 'U', viewValue: 'U' },
    { value: 'V', viewValue: 'V' },
    { value: 'W', viewValue: 'W' },
    { value: 'X', viewValue: 'X' },
    { value: 'Y', viewValue: 'Y' },
    { value: 'Z', viewValue: 'Z' }
  ];


  constructor(
    private machineService: MachineService,
    private alertService: AlertService,
    private router: Router,
    private formBuilder: FormBuilder,
    private groupService: GroupService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {

    this.newAlertPolicyForm = this.formBuilder.group({
      'type': ['', [Validators.required]],
      'item': ['', [Validators.required]],
      'priority': ['', [Validators.required]],
      'threshold': ['', []]
    })

  }

  ngOnInit() {

  }

  setFormValidators() {
    const thresholdControl = this.newAlertPolicyForm.get('threshold');
    this.newAlertPolicyForm.get('type').valueChanges
      .subscribe(type => {
        if (type == 'Drive') {
          thresholdControl.setValidators([Validators.required]);
        } else if (type != 'Drive') {
          thresholdControl.setValidators(null);
        }
        thresholdControl.updateValueAndValidity();
      });
  }

  submitForm(newAlertPolicyForm) {
    newAlertPolicyForm.assignedTo = this.data.machineId
    newAlertPolicyForm.assignmentType = "Machine"
    console.log(newAlertPolicyForm)
    this.alertService.postAlertPolicy(newAlertPolicyForm)
      .subscribe(alertPolicy => {
        this.router.navigate(['main/alertpolicies/' + alertPolicy._id])
      });
  }
}