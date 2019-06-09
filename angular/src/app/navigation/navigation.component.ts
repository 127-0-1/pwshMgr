import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  userName: string;

  constructor(
    private authService: AuthService
  ) {
    this.userName = localStorage.getItem('email')
   }

  ngOnInit() {


  }

  private changeName(name: string): void {
    this.userName = name;
}

logout(){
  this.authService.logout()
}

}