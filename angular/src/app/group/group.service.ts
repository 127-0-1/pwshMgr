import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, SingleGroupView } from './group.model';
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  apiPath: string

  constructor(private http: HttpClient) {
    this.apiPath = environment.apiPath
   }
  
  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiPath}/groups`);
  }

  getGroupById(groupID): Observable<SingleGroupView> {
    return this.http.get<SingleGroupView>(`${this.apiPath}/groups/` + groupID)
  }

  postGroup(group: Group): Observable<Group> {
    return this.http.post<Group>(`${this.apiPath}/groups/`, group);
  }

  updateGroup(group: Group, groupId) {
    return this.http.put<Group>(`${this.apiPath}/groups/${groupId}`, group);
  }

  deleteGroup(groupID) {
    return this.http.delete(`${this.apiPath}/groups/` + groupID);
  }

  addMachineToGroup(groupID:String, machineId:String){
    return this.http.get(`${this.apiPath}/groups/` + groupID + '/' + machineId)
  }

  addMultipleMachinesToGroup(data) {
    return this.http.post(`${this.apiPath}/groups/add-multiple`, data)
  }

  getSingleMachineGroups(machineId:String): Observable<Group[]>{
    return this.http.get<Group[]>(`${this.apiPath}/groups/machine` + '/' + machineId)
  }

  deleteMultipleGroups(groups){
    return this.http.post(`${this.apiPath}/groups/multiple/delete`, groups)
  }

  deleteMachineFromGroup(groupID, machineId){
    return this.http.delete(`${this.apiPath}/groups/` + groupID + '/' + machineId)
  }
}