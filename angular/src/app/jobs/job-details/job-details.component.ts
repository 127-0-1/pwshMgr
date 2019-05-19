import { Component, OnInit } from '@angular/core';
import { JobService } from '../jobs.service';
import { Job } from '../job.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {

  socket: SocketIOClient.Socket
  job: Job
  id: string;

  constructor(private jobService: JobService, private route: ActivatedRoute, private router: Router) {
    this.socket = io.connect()
    this.id = this.route.snapshot.params['id'];

  }

  ngOnInit() {
    this.jobService.getJobById(this.route.snapshot.params['id']).subscribe(job => this.job = job)
    this.socket.emit('room', this.id)
    this.socket.on('jobUpdate', (job: Job) => {
      console.log("received update")
      this.job = job
    })
  }


  delete() {
    this.jobService.deleteJob(this.job._id)
      .subscribe()
      this.router.navigate(['main/jobs'])
  }

  logName(id) {
    this.router.navigateByUrl('/machines', { skipLocationChange: true }).then(() =>
      this.router.navigate(["jobs/" + id]));
  }


}