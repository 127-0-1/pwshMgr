import { Component, OnInit, ViewChild } from '@angular/core';
import { Job } from '../../jobs/job.model'
import { JobService } from '../../jobs/jobs.service'
import { FormControl } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { RunScriptJobComponent } from '../run-script-job/run-script-job.component';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobs: Job[]
  filter = new FormControl('');
  temp: Job[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(
    private jobService: JobService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.tData = true;
    this.jobService.getAllJobs().subscribe((jobs: Array<Job>) => {
      this.jobs = jobs
      this.temp = [...jobs]
    })
  }
  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: '10%' }

    this.dialog.open(RunScriptJobComponent, dialogConfig);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      console.log(d)
      return d.machine.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.jobs = temp
    this.table.offset = 0
  }

  delete() {
    if (confirm("Are you sure to delete?")) {
      this.tData = false;
      let result = this.selected.map(a => a._id);
      this.jobService.deleteMultipleJobs(result).subscribe(() => {
        this.jobService.getAllJobs()
          .subscribe((jobs: Array<Job>) => {
            this.jobs = jobs
            this.temp = [...jobs]
            this.tData = true
            this.selected = []
          });
      })
    }
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }
}