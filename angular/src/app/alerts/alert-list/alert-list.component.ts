import { Component, OnInit, AfterContentInit, ViewChild } from '@angular/core';
import { AlertService } from '../alert.service';
import { Alert } from '../alert.model';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatGridList } from '@angular/material/grid-list';

export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-alert-list',
  templateUrl: './alert-list.component.html',
  styleUrls: ['./alert-list.component.css']
})
export class AlertListComponent implements OnInit, AfterContentInit {
  @ViewChild('grid', { static: true }) grid: MatGridList;
  alerts: Alert[]
  noAlerts: Boolean
  gridByBreakpoint = {
    xl: 6,
    lg: 4,
    md: 2
  }

  constructor(private alertService: AlertService, private mediaObserver: MediaObserver) {
    this.alertService.getAllAlerts()
      .subscribe((alerts: Array<Alert>) => {
        this.alerts = alerts
        if (!Array.isArray(this.alerts) || !this.alerts.length) {
          this.noAlerts = true
        }
      });
  }

  ngOnInit() {

  }

  color(alert) {
    switch (alert) {
      case "Low":
        return "#00BFFF"
      case "Medium":
        return "#ffff80"
      case "High":
        return "#ffc266"
      case "Urgent":
        return "#F08080"
    }

  }

  ngAfterContentInit() {
    this.mediaObserver.media$.subscribe((change: MediaChange) => {
      this.grid.cols = this.gridByBreakpoint[change.mqAlias];
    });
  }

}
