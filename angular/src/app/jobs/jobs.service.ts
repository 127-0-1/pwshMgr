import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Job, NewJob } from './job.model'
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class JobService {

  apiPath: string

  constructor(private http: HttpClient) {
    this.apiPath = environment.apiPath
  }
  
    getAllJobs(): Observable<Job[]> {
      return this.http.get<Job[]>(`${this.apiPath}/jobs`);
    }

    getSingleMachineJobs(machineId): Observable<Job[]> {
      return this.http.get<Job[]>(`${this.apiPath}/jobs?machine=${machineId}`);
    }
  
    getJobById(jobID): Observable<Job> {
      return this.http.get<Job>(`${this.apiPath}/jobs/` + jobID)
    }
  
    postJob(job: NewJob): Observable<NewJob> {
      return this.http.post<NewJob>(`${this.apiPath}/jobs`, job);
    }
  
    updateJob(job: Job) {
      return this.http.put(`${this.apiPath}/jobs`, job);
    }
  
    deleteJob(jobID) {
      return this.http.delete(`${this.apiPath}/jobs/` + jobID);
    }

    getSubJobs(jobID): Observable<Job[]>{
      return this.http.get<Job[]>(`${this.apiPath}/jobs/subjobs/` + jobID)
    }

    getJobsByMachine(machineID): Observable<Job[]>{
      return this.http.get<Job[]>(`h${this.apiPath}/machines/jobs/` + machineID)
    }

    deleteMultipleJobs(jobs) {
      return this.http.post(`${this.apiPath}/jobs/multiple/delete`, jobs)
    }
}