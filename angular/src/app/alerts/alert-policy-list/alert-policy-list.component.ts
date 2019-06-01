import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertService } from '../alert.service';
import { AlertPolicyView } from '../alertpolicy.model';
import { FormControl } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { MatDialog, MatDialogConfig } from "@angular/material";
import { NewAlertPolicyComponent } from '../new-alert-policy/new-alert-policy.component';


@Component({
  selector: 'app-alert-policy-list',
  templateUrl: './alert-policy-list.component.html',
  styleUrls: ['./alert-policy-list.component.css']
})
export class AlertPolicyListComponent implements OnInit {

  alertPolicies: AlertPolicyView[]
  filter = new FormControl('');
  temp: AlertPolicyView[]
  selected = [];
  tData: boolean = false;
  @ViewChild(DatatableComponent, { static: false }) table: DatatableComponent;


  constructor(
    private alertService: AlertService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.tData = true;
    this.alertService.getAllAlertPolicies()
      .subscribe((alertPolicies: Array<AlertPolicyView>) => {
        this.alertPolicies = alertPolicies
        this.temp = [...alertPolicies]
      });
  }

  updateFilter(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.temp.filter(function (d) {
      return d.name.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.alertPolicies = temp
    this.table.offset = 0
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '900px'
    dialogConfig.height = '600px'
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.position = { top: '5%' }

    this.dialog.open(NewAlertPolicyComponent, dialogConfig);
  }

  delete() {
    if (confirm("Are you sure to delete?")) {
      this.tData = false;
      let result = this.selected.map(a => a._id);
      this.alertService.deleteMultipleAlertPolicies(result).subscribe(() => {
        this.alertService.getAllAlertPolicies()
          .subscribe((alertPolicies: Array<AlertPolicyView>) => {
            this.alertPolicies = alertPolicies
            this.temp = [...alertPolicies]
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