import { Injectable } from '@angular/core';
import { AlertPolicy, AlertPolicyView } from './alertpolicy.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from './alert.model';
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  apiPath: string

  constructor(private http: HttpClient) {
    this.apiPath = environment.apiPath
  }

  

  getAllAlertPolicies(): Observable<AlertPolicyView[]> {
    return this.http.get<AlertPolicyView[]>(`${this.apiPath}/alertpolicies`);
  }

  getAllAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>(`${this.apiPath}/alerts`);
  }

  getSingleMachineAlerts(machineId): Observable<Alert[]>{
    return this.http.get<Alert[]>(`${this.apiPath}/alerts?machine=${machineId}`)
  }

  getSingleMachineAlertPolicies(machineId): Observable<AlertPolicyView[]>{
    return this.http.get<AlertPolicyView[]>(`${this.apiPath}/alertPolicies?machine=${machineId}`)
  }

  postAlertPolicy(alertpolicy: AlertPolicy): Observable<AlertPolicy>{
    return this.http.post<AlertPolicy>(`${this.apiPath}/alertpolicies`, alertpolicy)
  }

  getAlertPolicyById(alertPolicyId): Observable<AlertPolicyView> {
    return this.http.get<AlertPolicyView>(`${this.apiPath}/alertpolicies/` + alertPolicyId)
  }

  getAlertById(alertId): Observable<Alert> {
    return this.http.get<Alert>(`${this.apiPath}/alerts/` + alertId)
  }

  deleteAlert(alertId) {
    return this.http.delete(`${this.apiPath}/alerts/` + alertId)
  }

  deleteAlertPolicy(alertPolicyId) {
    return this.http.delete(`${this.apiPath}/alertpolicies/` + alertPolicyId);
  }

  deleteMultipleAlertPolicies(alertPolicies){
    return this.http.post(`${this.apiPath}/alertPolicies/multiple/delete`, alertPolicies)
  }
}
