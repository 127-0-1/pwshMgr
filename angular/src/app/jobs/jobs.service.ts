import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Job, NewJob } from './job.model'

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private http: HttpClient) {}

    getAllJobs(): Observable<Job[]> {
      return this.http.get<Job[]>('http://localhost:8080/api/jobs');
    }

    getSingleMachineJobs(machineId): Observable<Job[]> {
      return this.http.get<Job[]>(`http://localhost:8080/api/jobs?machine=${machineId}`);
    }
  
    getJobById(jobID): Observable<Job> {
      return this.http.get<Job>('http://localhost:8080/api/jobs/' + jobID)
    }
  
    postJob(job: NewJob): Observable<NewJob> {
      return this.http.post<NewJob>('http://localhost:8080/api/jobs', job);
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

    deleteMultipleJobs(jobs) {
      return this.http.post('http://localhost:8080/api/jobs/multiple/delete', jobs)
    }
}