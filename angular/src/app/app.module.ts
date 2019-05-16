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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, MatDialogContainer, MatDatepickerModule, MatCardModule, MatIconModule, MatInputModule, MatButtonModule, MatSelectModule, MatSnackBarModule, MatToolbarModule, MatGridListModule, MatSidenavModule, MatListModule, MatDialogContent, MatDialogModule } from '@angular/material';
import { NavigationComponent } from './navigation/navigation.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { HomeLayoutComponent } from './home-layout/home-layout.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ErrorDialogService } from './error-dialog.service';
import { FlexLayoutModule } from '@angular/flex-layout';


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
    NewGroupComponent,
    NavigationComponent,
    ToolbarComponent,
    LoginLayoutComponent,
    HomeLayoutComponent,
    ErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatGridListModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ModalModule.forRoot(),
    CollapseModule.forRoot(),
    RouterModule.forRoot([
      { path: '', redirectTo: 'login', data: { title: 'First Component' }, pathMatch: 'full' },
      {
        path: 'login', component: LoginLayoutComponent, data: { title: 'First Component' },
        children: [
          { path: '', component: LoginComponent }
        ]
      },
      {
        path: 'main', component: HomeLayoutComponent,
        children: [
          { path: '', redirectTo: 'machines', pathMatch: 'full' },
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
        ]
      }
    ]),
    FormsModule,
    ReactiveFormsModule,
    NgxDatatableModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    MachineService, 
    UserService, 
    ApplicationService, 
    ScriptService, 
    IntegrationService, 
    JobService, DashboardService, AuthGuard, GroupService, ErrorDialogService],
    entryComponents: [ErrorDialogComponent, NewGroupComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }