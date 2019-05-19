import { Machine, Job } from './machine.model'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Alert } from '../alerts/alert.model';

@Injectable({
  providedIn: 'root'
})
export class MachineService {

  constructor(private http: HttpClient) {}

    getAllMachines(): Observable<Machine[]> {
      return this.http.get<Machine[]>('http://localhost:8080/api/machines');
    }
  
    getMachineById(machineID): Observable<Machine> {
      return this.http.get<Machine>('http://localhost:8080/api/machines/' + machineID)
    }

    updateMachine(machine: Machine): Observable<Machine> {
      return this.http.put<Machine>('http://localhost:8080/api/machines/' + machine._id, machine);
    }
  
    deleteMachine(machineID) {
      return this.http.delete('http://localhost:8080/api/machines/' + machineID);
    }

    getJobByMachine(machineID): Observable<Job[]> {
      return this.http.get<Job[]>('http://localhost:8080/api/machines/jobs/' + machineID);
    }

    // getMachineDrives(machineID): Observable<DriveDetails> {
    //   return this.http.get<DriveDetails>('http://localhost:8080/api/machines/' + machineID + '/drives');
    // }

    getAlertByMachine(machineID): Observable<Alert[]> {
      return this.http.get<Alert[]>('http://localhost:8080/api/machines/alerts/' + machineID)
    }

    deleteMultiple(machines){
      return this.http.put('http://localhost:8080/api/machines/multiple', machines)
    }

}