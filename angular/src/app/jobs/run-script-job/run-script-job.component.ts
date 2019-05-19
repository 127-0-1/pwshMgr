import { Component, OnInit } from '@angular/core';
import { Script } from '../../script/script.model';
import { Machine } from '../../machine/machine.model';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { JobService } from '../jobs.service';
import { MachineService } from '../../machine/machine.service';
import { ScriptService } from '../../script/script.service';
import { Router } from '@angular/router';
import { Job } from '../job.model';
import { MatDialogRef } from "@angular/material";

@Component({
  selector: 'app-run-script-job',
  templateUrl: './run-script-job.component.html',
  styleUrls: ['./run-script-job.component.css']
})
export class RunScriptJobComponent implements OnInit {

  newJobForm: FormGroup;
  scripts: Script[]
  machines: Machine[]

  constructor(
    private jobService: JobService,
    private formBuilder: FormBuilder,
    private machineService: MachineService,
    private scriptService: ScriptService,
    private router: Router,
    private dialogRef: MatDialogRef<RunScriptJobComponent>
  ) {
    this.newJobForm = this.formBuilder.group({
      'machine': ['', [Validators.required]],
      'script': ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.machineService.getAllMachines()
      .subscribe((machines: Array<Machine>) => this.machines = machines)
    this.scriptService.getAllScripts()
      .subscribe((scripts: Array<Script>) => this.scripts = scripts)
  }

  submitForm(newJob: Job) {
    newJob.subJob = false
    this.jobService.postJob(newJob)
      .subscribe(newJob => {
        this.router.navigate(['main/jobs/' + newJob._id])
        this.dialogRef.close()
      });
  }

}