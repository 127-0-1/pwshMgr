import { Component, OnInit, TemplateRef } from '@angular/core';
import { Group, SingleGroupView, Machine } from '../group.model';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MachineService } from 'src/app/machine/machine.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group: SingleGroupView
  id: String
  machines: Machine[]
  selectedMachine: String
  machineDisplayedColumns: string[] = ['name', 'operatingSystem', 'status'];

  constructor(private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
    private machineService: MachineService
    ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.groupService.getGroupById(this.id)
      .subscribe(group => {
         this.group = group
         this.machines = group.machines
        })
  }

  deleteGroup() {
    this.groupService.deleteGroup(this.group._id)
      .subscribe()
    this.router.navigate(['main/groups'])
  }

  deleteFromGroup(machineId){
    this.groupService.deleteMachineFromGroup(this.id, machineId)
    .subscribe((group: SingleGroupView) => this.group = group)
  }

}