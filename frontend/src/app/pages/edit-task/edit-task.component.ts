import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TaskService } from '../../task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.scss'
})
export class EditTaskComponent {
  
  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router) {}

  taskId: string = "";
  listId: string = "";
  taskNotes: string = "";

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.taskId = params['taskId'];
        this.listId = params['listId'];
      }
    )

    this.taskNotes = localStorage.getItem('taskNotes')!;
  }

  updateTask(title: string){
    this.taskService.updateTask(this.taskId, this.listId, title).subscribe(() => {
      this.router.navigate(['/lists', this.listId]);
    })
  }

  updateTaskNotes(notes: string){
    this.taskService.updateTaskNotes(this.taskId, this.listId, notes).subscribe(() => {
      this.router.navigate(['/lists', this.listId]);
    })
  }
}
