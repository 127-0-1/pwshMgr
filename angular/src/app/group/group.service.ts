import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group, SingleGroupView } from './group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private http: HttpClient) { }

  getAllGroups(): Observable<Group[]> {
    return this.http.get<Group[]>('http://localhost:8080/api/groups');
  }

  getGroupById(groupID): Observable<SingleGroupView> {
    return this.http.get<SingleGroupView>('http://localhost:8080/api/groups/' + groupID)
  }

  postGroup(group: Group): Observable<Group> {
    return this.http.post<Group>('http://localhost:8080/api/groups/', group);
  }

  updateGroup(group: Group): Observable<Group> {
    return this.http.put<Group>('http://localhost:8080/api/groups', group);
  }

  deleteGroup(groupID) {
    return this.http.delete('http://localhost:8080/api/groups/' + groupID);
  }

  addMachineToGroup(groupID:String, machineId:String){
    return this.http.get('http://localhost:8080/api/groups/' + groupID + '/' + machineId)
  }

  
  getSingleMachineGroups(machineId:String): Observable<Group[]>{
    return this.http.get<Group[]>('http://localhost:8080/api/groups/machine' + '/' + machineId)
  }

  deleteMachineFromGroup(groupID, machineId){
    return this.http.delete('http://localhost:8080/api/groups/' + groupID + '/' + machineId)
  }
}