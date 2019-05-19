import { Component, OnInit } from '@angular/core';
import { Script } from '../script.model';
import { ScriptService } from '../script.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-script-details',
  templateUrl: './script-details.component.html',
  styleUrls: ['./script-details.component.css']
})
export class ScriptDetailsComponent implements OnInit {

  script: Script
  id: String

  constructor(private scriptService: ScriptService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];

    this.scriptService.getScriptById(this.id)
    .subscribe(script => {this.script = script})
  }


  deleteScript(){
    this.scriptService.deleteScript(this.script._id)
    .subscribe()
    this.router.navigate(['main/scripts'])
  }

}