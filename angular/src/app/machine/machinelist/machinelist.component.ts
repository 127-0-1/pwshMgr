import { Component, OnInit, PipeTransform, ViewChild } from '@angular/core';
import { MachineService } from '../machine.service'
import { Machine } from '../machine.model'
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormControl } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs'; // Angular 6 

@Component({
  selector: 'app-machinelist',
  templateUrl: './machinelist.component.html',
  styleUrls: ['./machinelist.component.css']
})
export class MachinelistComponent implements OnInit {

  machines: Machine[]
  filter = new FormControl('');
  temp: Machine[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private machineService: MachineService, private router: Router) {
  }

  ngOnInit() {
    this.tData = true;
    this.machineService.getAllMachines()
      .subscribe((machines: Array<Machine>) => {
        this.machines = machines
        this.temp = [...machines]
      });
  }

  runThis(machine) {
    if (machine.status == "Offline") {
      return "table-danger"
    }
    if (machine.status == "Online, WinRM unreachable") {
      return "table-danger"
    }
    if (machine.status == "Maintenance") {
      return "table-warning"
    }
  }


  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.machines = temp
    this.table.offset = 0
  }

  delete() {
    this.tData = false;
    let result = this.selected.map(a => a._id);
    this.machineService.deleteMultiple(result).subscribe(() => {
      this.machineService.getAllMachines()
        .subscribe((machines: Array<Machine>) => {
          this.machines = machines
          this.temp = [...machines]
          this.tData = true
          this.selected = []
        });
    })
  }

  onSelect({ selected }) {
    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  routeToMachineDetails(valObj: any) {
    this.router.navigate(['/machines/' + valObj._id])
  }
}