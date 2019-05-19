import { Component, OnInit, TemplateRef, OnDestroy, Inject } from '@angular/core';
import { MachineService } from '../machine.service';
import { Machine, Job, Application, Process, Drive, Service } from '../machine.model';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as io from 'socket.io-client';
import { JobService } from '../../jobs/jobs.service';
import { Alert } from '../../alerts/alert.model';
import { GroupService } from 'src/app/group/group.service';
import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { MachineAddToGroupDialogComponent } from './machine-add-to-group-dialog/machine-add-to-group-dialog.component';
import { Group } from 'src/app/group/group.model';
import { SelectionModel } from '@angular/cdk/collections';

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
  alerts: Alert[];
  applicationDisplayedColumns: string[] = ['name', 'version'];
  processDisplayedColumns: string[] = ['name', 'pId'];
  serviceDisplayedColumns: string[] = ['displayName', 'status'];
  driveDisplayedColumns: string[] = ['name', 'usedGb', 'freeGb'];
  groupDisplayedColumns: string[] = ['name', 'actions'];

  constructor(
    private machineService: MachineService,
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private dialog: MatDialog
  ) {
    // this.socket = io.connect("http://localhost:8080")
    this.id = this.route.snapshot.params['id'];
  }

  ngOnInit() {
    this.machineService.getMachineById(this.id)
      .subscribe(machine => {
        this.machine = machine
        this.applications = machine.applications
        this.processes = machine.processes
        this.drives = machine.drives
        this.services = machine.services
      });
    // this.socket.emit('room', this.id)
    // this.socket.on('machineUpdate', (machine: Machine) => {
    //   console.log("received update")
    //   this.machine = machine
    // })
  }

  deleteMachine() {
    this.machineService.deleteMachine(this.machine._id)
      .subscribe()
    this.router.navigate(['main/machines'])
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

  showJobs() {
    this.machineService.getJobByMachine(this.id)
      .subscribe((jobs: Array<Job>) => this.jobs = jobs)
  }

  showAlerts() {
    this.machineService.getAlertByMachine(this.id)
      .subscribe((alerts: Array<Alert>) => this.alerts = alerts)
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
}