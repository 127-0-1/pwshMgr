import { Component, OnInit, OnDestroy, Inject } from "@angular/core";
import { Subscription } from "rxjs";
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from "../auth/auth.service";
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../group/group-details/group-details.component';

export interface ResetPasswordReturn {
  message: string
}

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit, OnDestroy {

  isLoading = false;
  private authStatusSub: Subscription;
  loginForm: FormGroup;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.loginForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
      authStatus => {
        this.isLoading = false;
      }
    );
  }

  onLogin(form) {
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }

  resetPassword() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    dialogConfig.autoFocus = true;
    dialogConfig.width = '500px'
    dialogConfig.height = '300px'
    dialogConfig.position = { top: '10%' }
    this.dialog.open(ResetPasswordDialog, dialogConfig);
  }
}

@Component({
  selector: 'reset-password-dialog',
  templateUrl: 'reset-password-dialog.html'
})
export class ResetPasswordDialog {

  resetPasswordForm: FormGroup
  resetPasswordReturn: ResetPasswordReturn
  success: Boolean
  loading: Boolean

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public dialogRef: MatDialogRef<ResetPasswordDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      'email': ['', [Validators.email]]
    })
  }

  submitForm(resetPasswordForm) {
    this.loading = true
    this.authService.requestPasswordReset(resetPasswordForm).subscribe(
      data => {
        if (data.message === "SUCCESS") {
          this.loading = false
          this.success = true
        }
      },
      err => {
        this.loading = false
      })
  }

  closeDialog() {
    this.dialogRef.close()
  }
}