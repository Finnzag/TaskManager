import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {

  constructor(private authService: AuthService, private router: Router) {}

  onLoginButtonClicked(email: string, password: string) {
    this.authService.login(email, password).subscribe((res: HttpResponse<any>) => {
      if (res.status === 200){
        // logged in successfully
        this.router.navigate(['/lists']);
      }
      console.log(res);
      
    })
  }
}
