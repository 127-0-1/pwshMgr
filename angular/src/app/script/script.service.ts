import { Script } from './script.model'
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class ScriptService {

  constructor(private http: HttpClient) {}

    getAllScripts(): Observable<Script[]> {
      return this.http.get<Script[]>('http://localhost:8080/api/scripts');
    }
  
    getScriptById(scriptID): Observable<Script> {
      return this.http.get<Script>('http://localhost:8080/api/scripts/' + scriptID)
    }
  
    postScript(script: Script): Observable<Script> {
      return this.http.post<Script>('http://localhost:8080/api/scripts/', script);
    }
  
    updateScript(script: Script, scriptId): Observable<Script> {
      return this.http.put<Script>(`http://localhost:8080/api/scripts/${scriptId}`, script);
    }
  
    deleteScript(scriptID) {
      return this.http.delete('http://localhost:8080/api/scripts/' + scriptID);
    }

    deleteMultipleScripts(scripts){
      return this.http.post('http://localhost:8080/api/scripts/multiple/delete', scripts)
    }
    
}