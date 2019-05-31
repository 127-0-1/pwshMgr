import { Component, OnInit } from '@angular/core';
import { AlertService } from '../alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertPolicyView } from '../alertpolicy.model';

@Component({
  selector: 'app-alert-policy-details',
  templateUrl: './alert-policy-details.component.html',
  styleUrls: ['./alert-policy-details.component.css']
})
export class AlertPolicyDetailsComponent implements OnInit {

  alertPolicy: AlertPolicyView
  id: String

  constructor(private alertService: AlertService,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.alertService.getAlertPolicyById(this.id)
    .subscribe(alertPolicy => {
      this.alertPolicy = alertPolicy
    });
  }

  delete() {
    this.alertService.deleteAlertPolicy(this.alertPolicy._id)
      .subscribe()
      this.router.navigate(['main/alertpolicies'])
  }

}