import { Component, OnInit } from '@angular/core';
import { Group } from '../group.model';
import { GroupService } from '../group.service';

@Component({
  selector: 'app-group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnInit {

  groups: Group[]

  constructor(private groupService: GroupService) { }

  ngOnInit() {
    this.groupService.getAllGroups()
      .subscribe((groups: Array<Group>) => this.groups = groups)
  }

}