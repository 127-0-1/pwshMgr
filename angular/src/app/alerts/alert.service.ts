import { Injectable } from '@angular/core';
import { AlertPolicy, AlertPolicyView } from './alertpolicy.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alert } from './alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(private http: HttpClient) {}


  getAllAlertPolicies(): Observable<AlertPolicyView[]> {
    return this.http.get<AlertPolicyView[]>('http://localhost:8080/api/alertpolicies');
  }

  getAllAlerts(): Observable<Alert[]> {
    return this.http.get<Alert[]>('http://localhost:8080/api/alerts');
  }

  postAlertPolicy(alertpolicy: AlertPolicy): Observable<AlertPolicy>{
    return this.http.post<AlertPolicy>('http://localhost:8080/api/alertpolicies', alertpolicy)
  }

  getAlertPolicyById(alertPolicyId): Observable<AlertPolicyView> {
    return this.http.get<AlertPolicyView>('http://localhost:8080/api/alertpolicies/' + alertPolicyId)
  }

  getAlertById(alertId): Observable<Alert> {
    return this.http.get<Alert>('http://localhost:8080/api/alerts/' + alertId)
  }

  deleteAlert(alertId) {
    return this.http.delete('http://localhost:8080/api/alerts/' + alertId)
  }

  deleteAlertPolicy(alertPolicyId) {
    return this.http.delete('http://localhost:8080/api/alertpolicies/' + alertPolicyId);
  }

  deleteMultipleAlertPolicies(alertPolicies){
    return this.http.post('http://localhost:8080/api/alertPolicies/multiple/delete', alertPolicies)
  }
}
