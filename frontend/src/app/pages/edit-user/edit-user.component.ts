import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent {

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  userId: any = this.authService.getUserId();


  updatePassword(CurrentPassword: string, newPassword: string) {
    
    this.authService.changePassword(this.userId, CurrentPassword, newPassword).subscribe(() => {
      console.log("Password Updated");
    })
  }

}
