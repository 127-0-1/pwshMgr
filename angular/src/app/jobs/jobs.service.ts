import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Job } from './job.model'

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private http: HttpClient) {}

    getAllJobs(): Observable<Job[]> {
      return this.http.get<Job[]>('http://localhost:8080/api/jobs');
    }
  
    getJobById(jobID): Observable<Job> {
      return this.http.get<Job>('http://localhost:8080/api/jobs/' + jobID)
    }
  
    postJob(job: Job): Observable<Job> {
      return this.http.post<Job>('http://localhost:8080/api/jobs', job);
    }
  
    updateJob(job: Job) {
      return this.http.put('http://localhost:8080/api/jobs', job);
    }
  
    deleteJob(jobID) {
      return this.http.delete('http://localhost:8080/api/jobs/' + jobID);
    }

    getSubJobs(jobID): Observable<Job[]>{
      return this.http.get<Job[]>('http://localhost:8080/api/jobs/subjobs/' + jobID)
    }

    getJobsByMachine(machineID): Observable<Job[]>{
      return this.http.get<Job[]>('http://localhost:8080/api/machines/jobs/' + machineID)
    }
}