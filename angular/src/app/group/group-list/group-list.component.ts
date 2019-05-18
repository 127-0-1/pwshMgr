import { Component, OnInit, ViewChild } from '@angular/core';
import { Group } from '../group.model';
import { GroupService } from '../group.service';
import { FormControl } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { NewGroupComponent } from '../new-group/new-group.component';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  groups: Group[]
  filter = new FormControl('');
  temp: Group[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private groupService: GroupService, private dialog: MatDialog) { }

  ngOnInit() {
    this.tData = true;
    this.groupService.getAllGroups()
      .subscribe((groups: Array<Group>) => {
        this.groups = groups
        this.temp = [...groups]
      });
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: '10%'}

    this.dialog.open(NewGroupComponent, dialogConfig);
}

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.groups = temp
    this.table.offset = 0
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

}