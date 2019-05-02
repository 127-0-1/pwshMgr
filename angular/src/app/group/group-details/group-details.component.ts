import { Component, OnInit, TemplateRef } from '@angular/core';
import { Group, SingleGroupView, Machine } from '../group.model';
import { GroupService } from '../group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { MachineService } from 'src/app/machine/machine.service';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {

  group: SingleGroupView
  id: String
  modalRef: BsModalRef;
  modalConfig = {
    animated: false,
    class: 'modal-lg',
    ignoreBackdropClick: true
  };
  machines: Machine[]
  selectedMachine: String

  constructor(private groupService: GroupService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private machineService: MachineService) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.groupService.getGroupById(this.id)
      .subscribe(group => { this.group = group })
  }

  deleteGroup() {
    this.groupService.deleteGroup(this.group._id)
      .subscribe()
    this.router.navigate(['groups'])
  }

  addMachineToGroup(template: TemplateRef<any>) {
    this.machineService.getAllMachines()
      .subscribe((machines: Array<Machine>) => this.machines = machines)
    this.modalRef = this.modalService.show(template, this.modalConfig);
  }

  addToGroup(){
    this.groupService.addMachineToGroup(this.id, this.selectedMachine)
    .subscribe((group: SingleGroupView) => this.group = group)
    this.modalRef.hide()
  }

  deleteFromGroup(machineId){
    this.groupService.deleteMachineFromGroup(this.id, machineId)
    .subscribe((group: SingleGroupView) => this.group = group)
  }

}