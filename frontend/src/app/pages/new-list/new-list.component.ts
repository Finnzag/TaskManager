import { Component } from '@angular/core';
import { TaskService } from '../../task.service';
import { Router } from '@angular/router';
import { list } from '../../models/list.model';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrl: './new-list.component.scss'
})
export class NewListComponent {

  constructor(private taskservice: TaskService, private router: Router) {}

CreateList(title: string) {
  this.taskservice.createList(title).subscribe(next => {
    const list:list = next as list
    // Navigate to newly created list
    this.router.navigate(['/lists', list._id]);
  })
}

}
