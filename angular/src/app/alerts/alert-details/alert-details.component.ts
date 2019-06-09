import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Alert } from '../alert.model';

@Component({
  selector: 'app-alert-details',
  templateUrl: './alert-details.component.html',
  styleUrls: ['./alert-details.component.css']
})
export class AlertDetailsComponent implements OnInit {

  alert: Alert;
  id: String;

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.alertService.getAlertById(this.id)
      .subscribe(alert => {
        this.alert = alert
      });
  }

  delete() {
    this.alertService.deleteAlert(this.alert._id)
      .subscribe()
      this.router.navigate(['main/alerts'])
  }

}
