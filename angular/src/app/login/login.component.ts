import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { FormBuilder, FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { AuthService } from "../auth/auth.service";

@Component({
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription;
  loginForm: FormGroup;

  constructor(public authService: AuthService, private fb: FormBuilder) {
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
}
