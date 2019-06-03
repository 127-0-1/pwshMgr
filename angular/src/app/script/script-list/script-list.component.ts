import { Component, OnInit, ViewChild } from '@angular/core';
import { Script } from '../script.model';
import { ScriptService } from '../script.service';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { FormControl } from '@angular/forms';
import { NewScriptComponent } from '../new-script/new-script.component';

@Component({
  selector: 'app-script-list',
  templateUrl: './script-list.component.html',
  styleUrls: ['./script-list.component.css']
})
export class ScriptListComponent implements OnInit {

  scripts: Script[]
  temp: Script[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;

  constructor(
    private scriptService: ScriptService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.tData = true;
    this.scriptService.getAllScripts()
      .subscribe((scripts: Array<Script>) => {
        this.scripts = scripts
        this.temp = [...scripts]
      });
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px'
    dialogConfig.height = '600px'
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: '5%' }

    this.dialog.open(NewScriptComponent, dialogConfig);
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.scripts = temp
    this.table.offset = 0
  }

  delete() {
    if (confirm("Are you sure to delete?")) {
      this.tData = false;
      let result = this.selected.map(a => a._id);
      this.scriptService.deleteMultipleScripts(result).subscribe(() => {
        this.scriptService.getAllScripts()
          .subscribe((scripts: Array<Script>) => {
            this.scripts = scripts
            this.temp = [...scripts]
            this.tData = true
            this.selected = []
          });
      })
    }
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

}
