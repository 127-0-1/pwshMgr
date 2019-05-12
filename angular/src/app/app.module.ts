import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MachinelistComponent } from './machine/machinelist/machinelist.component';
import { MachineService } from './machine/machine.service';
import { RouterModule } from '@angular/router';
import { MachinedetailsComponent } from './machine/machinedetails/machinedetails.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { UserService } from './users/user.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PageHeaderComponent } from './page-header/page-header.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ApplicationService } from './applications/application.service';
import { NewApplicationComponent } from './applications/new-application/new-application.component';
import { ApplicationDetailsComponent } from './applications/application-details/application-details.component';
import { ApplicationListComponent } from './applications/application-list/application-list.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { NewUserComponent } from './users/new-user/new-user.component';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component';
import { ScriptService } from './script/script.service';
import { NewScriptComponent } from './script/new-script/new-script.component';
import { NewDiskAlertComponent } from './alerts/new-disk-alert/new-disk-alert.component';
import { AlertPolicyListComponent } from './alerts/alert-policy-list/alert-policy-list.component';
import { AlertListComponent } from './alerts/alert-list/alert-list.component';
import { NewWindowsServiceAlertComponent } from './alerts/new-windows-service-alert/new-windows-service-alert.component';
import { IntegrationService } from './integrations/integration.service';
import { NewSlackIntegrationComponent } from './integrations/new-slack-integration/new-slack-integration.component';
import { AlertPolicyDetailsComponent } from './alerts/alert-policy-details/alert-policy-details.component';
import { AlertDetailsComponent } from './alerts/alert-details/alert-details.component';
import { ScriptListComponent } from './script/script-list/script-list.component';
import { ScriptDetailsComponent } from './script/script-details/script-details.component';
import { JobDetailsComponent } from './jobs/job-details/job-details.component';
import { JobListComponent } from './jobs/job-list/job-list.component';
import { NewJobComponent } from './jobs/new-job/new-job.component';
import { JobService } from './jobs/jobs.service';
import { RunScriptJobComponent } from './jobs/run-script-job/run-script-job.component';
import { NewProcessAlertComponent } from './alerts/new-process-alert/new-process-alert.component';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from "./auth/auth-interceptor";
import { AuthGuard } from './auth/auth.guard';
import { IntegrationListComponent } from './integrations/integration-list/integration-list.component';
import { IntegrationDetailComponent } from './integrations/integration-detail/integration-detail.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { DashboardService } from './dashboard/dashboard.service';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupService } from './group/group.service';
import { GroupDetailsComponent } from './group/group-details/group-details.component';
import { NewGroupComponent } from './group/new-group/new-group.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    AppComponent,
    MachinelistComponent,
    MachinedetailsComponent,
    PageHeaderComponent,
    NewApplicationComponent,
    ApplicationDetailsComponent,
    ApplicationListComponent,
    UserListComponent,
    NewUserComponent,
    LoginComponent,
    NewScriptComponent,
    NewDiskAlertComponent,
    AlertPolicyListComponent,
    AlertListComponent,
    NewWindowsServiceAlertComponent,
    NewSlackIntegrationComponent,
    AlertPolicyDetailsComponent,
    AlertDetailsComponent,
    ScriptListComponent,
    ScriptDetailsComponent,
    JobDetailsComponent,
    JobListComponent,
    NewJobComponent,
    RunScriptJobComponent,
    NewProcessAlertComponent,
    IntegrationListComponent,
    IntegrationDetailComponent,
    DashboardComponent,
    GroupListComponent,
    GroupDetailsComponent,
    NewGroupComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    RouterModule.forRoot([
      {
        path: 'applications/new',
        component: NewApplicationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alerts/new-disk-space',
        component: NewDiskAlertComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alerts/new/process',
        component: NewProcessAlertComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alerts/new-windows-service',
        component: NewWindowsServiceAlertComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'integrations/new-slack',
        component: NewSlackIntegrationComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'scripts/new',
        component: NewScriptComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'groups/new',
        component: NewGroupComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'jobs/new',
        component: NewJobComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'jobs/new/script',
        component: RunScriptJobComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'applications/:id',
        component: ApplicationDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'machines/:id',
        component: MachinedetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'scripts/:id',
        component: ScriptDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alertpolicies/:id',
        component: AlertPolicyDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'groups/:id',
        component: GroupDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'jobs/:id',
        component: JobDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'integrations/:id',
        component: IntegrationDetailComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alerts/:id',
        component: AlertDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'scripts',
        component: ScriptListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'integrations',
        component: IntegrationListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'jobs',
        component: JobListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alertpolicies',
        component: AlertPolicyListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'alerts',
        component: AlertListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'login',
        component: LoginComponent
      },
      {
        path: 'applications',
        component: ApplicationListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'machines',
        component: MachinelistComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'groups',
        component: GroupListComponent,
        canActivate: [AuthGuard]
      },
      { path: '**', redirectTo: 'machines', pathMatch: 'full' },
    ]),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MachineService, UserService, ApplicationService, ScriptService, IntegrationService, JobService, DashboardService, AuthGuard, GroupService],
  bootstrap: [AppComponent]
})
export class AppModule { }