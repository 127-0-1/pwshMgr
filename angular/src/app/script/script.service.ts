import { Script } from './script.model'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  apiPath: string

  constructor(private http: HttpClient) {
    this.apiPath = environment.apiPath
  }
  
    getAllScripts(): Observable<Script[]> {
      return this.http.get<Script[]>(`${this.apiPath}/scripts`);
    }
  
    getScriptById(scriptID): Observable<Script> {
      return this.http.get<Script>(`${this.apiPath}/scripts/` + scriptID)
    }
  
    postScript(script: Script): Observable<Script> {
      return this.http.post<Script>(`${this.apiPath}/scripts/`, script);
    }
  
    updateScript(script: Script, scriptId): Observable<Script> {
      return this.http.put<Script>(`${this.apiPath}/scripts/${scriptId}`, script);
    }
  
    deleteScript(scriptID) {
      return this.http.delete(`${this.apiPath}/scripts/` + scriptID);
    }

    deleteMultipleScripts(scripts){
      return this.http.post(`${this.apiPath}/scripts/multiple/delete`, scripts)
    }
    
}