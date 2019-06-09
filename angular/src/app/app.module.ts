import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { MachinelistComponent } from './machine/machine-list/machine-list.component';
import { MachineService } from './machine/machine.service';
import { RouterModule } from '@angular/router';
import { MachinedetailsComponent, RunJobDialog, NewAlertPolicyDialog } from './machine/machine-details/machine-details.component';
import { UserService } from './users/user.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PageHeaderComponent } from './page-header/page-header.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { NewUserComponent } from './users/new-user/new-user.component';
import { environment } from '../environments/environment';
import { LoginComponent, ResetPasswordDialog } from './login/login.component';
import { ScriptService } from './script/script.service';
import { NewScriptComponent } from './script/new-script/new-script.component';
import { AlertPolicyListComponent } from './alerts/alert-policy-list/alert-policy-list.component';
import { AlertListComponent } from './alerts/alert-list/alert-list.component';
import { NewAlertPolicyComponent } from './alerts/new-alert-policy/new-alert-policy.component';
import { IntegrationService } from './integrations/integration.service';
import { NewSlackIntegrationComponent } from './integrations/new-slack-integration/new-slack-integration.component';
import { AlertPolicyDetailsComponent } from './alerts/alert-policy-details/alert-policy-details.component';
import { AlertDetailsComponent } from './alerts/alert-details/alert-details.component';
import { ScriptListComponent } from './script/script-list/script-list.component';
import { ScriptDetailsComponent, EditScriptDialog } from './script/script-details/script-details.component';
import { JobDetailsComponent } from './jobs/job-details/job-details.component';
import { JobListComponent } from './jobs/job-list/job-list.component';
import { JobService } from './jobs/jobs.service';
import { RunScriptJobComponent } from './jobs/run-script-job/run-script-job.component';
import { AuthService } from './auth/auth.service';
import { AuthInterceptor } from "./auth/auth-interceptor";
import { AuthGuard } from './auth/auth.guard';
import { IntegrationListComponent } from './integrations/integration-list/integration-list.component';
import { IntegrationDetailComponent } from './integrations/integration-detail/integration-detail.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { DashboardService } from './dashboard/dashboard.service';
import { GroupListComponent } from './group/group-list/group-list.component';
import { GroupService } from './group/group.service';
import { GroupDetailsComponent, AddMachinesToGroupDialog, RenameGroupDialog } from './group/group-details/group-details.component';
import { NewGroupComponent } from './group/new-group/new-group.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogContainer, MatDialogContent, MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationComponent } from './navigation/navigation.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { LoginLayoutComponent } from './login-layout/login-layout.component';
import { HomeLayoutComponent } from './home-layout/home-layout.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { ErrorDialogService } from './error-dialog.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MachineAddToGroupDialogComponent } from './machine/machine-details/machine-add-to-group-dialog/machine-add-to-group-dialog.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    MachinelistComponent,
    MachinedetailsComponent,
    PageHeaderComponent,
    UserListComponent,
    NewUserComponent,
    LoginComponent,
    NewScriptComponent,
    AlertPolicyListComponent,
    AlertListComponent,
    NewAlertPolicyComponent,
    NewSlackIntegrationComponent,
    AlertPolicyDetailsComponent,
    AlertDetailsComponent,
    ScriptListComponent,
    ScriptDetailsComponent,
    JobDetailsComponent,
    JobListComponent,
    RunScriptJobComponent,
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
    ErrorDialogComponent,
    MachineAddToGroupDialogComponent,
    RunJobDialog,
    NewAlertPolicyDialog,
    AddMachinesToGroupDialog,
    ResetPasswordDialog,
    ResetPasswordComponent,
    EditScriptDialog,
    RenameGroupDialog
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
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    MatSidenavModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatGridListModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'login', data: { title: 'First Component' }, pathMatch: 'full' },
      {
        path: 'login', component: LoginLayoutComponent, data: { title: 'First Component' },
        children: [
          { path: '', component: LoginComponent },
          { path: 'reset-password/:token', component: ResetPasswordComponent }
        ]
      },
      {
        path: 'main', component: HomeLayoutComponent,
        children: [
          { path: '', redirectTo: 'machines', pathMatch: 'full' },
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
    ScriptService,
    IntegrationService,
    JobService,
    DashboardService,
    AuthGuard,
    GroupService,
    ErrorDialogService,
    AuthService
  ],
  entryComponents: [
    ErrorDialogComponent,
    NewGroupComponent,
    MachineAddToGroupDialogComponent,
    NewScriptComponent,
    RunScriptJobComponent,
    NewAlertPolicyComponent,
    RunJobDialog,
    NewAlertPolicyDialog,
    AddMachinesToGroupDialog,
    ResetPasswordDialog,
    EditScriptDialog,
    RenameGroupDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }