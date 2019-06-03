import { Machine } from './machine.model'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Alert } from '../alerts/alert.model';
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MachineService {
  
  apiPath: string

  constructor(private http: HttpClient) {
    if (environment.production){
      console.log("this is production")
      this.apiPath = "/api/"
      } else {
        console.log("this is development")
        this.apiPath = "http://localhost:8080/api/"
      }
  }
  

    getAllMachines(): Observable<Machine[]> {
      return this.http.get<Machine[]>(`${this.apiPath}/machines`);
    }
  
    getMachineById(machineID): Observable<Machine> {
      return this.http.get<Machine>(`${this.apiPath}/machines/${machineID}`)
    }

    updateMachine(machine: Machine): Observable<Machine> {
      return this.http.put<Machine>(`${this.apiPath}/machines/${machine._id}`, machine);
    }
  
    deleteMachine(machineID) {
      return this.http.delete(`${this.apiPath}/machines/${machineID}`);
    }

    getAlertByMachine(machineID): Observable<Alert[]> {
      return this.http.get<Alert[]>(`${this.apiPath}/machines/alerts/${machineID}`)
    }

    deleteMultiple(machines){
      return this.http.put(`${this.apiPath}/machines/multiple`, machines)
    }

    getMachineSpecificItems(machineId, option): Observable<any>{
      return this.http.get<any>(`${this.apiPath}/machines/${machineId}?select=${option}`)
    }

}