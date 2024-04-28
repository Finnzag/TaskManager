import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { task } from '../../models/task.model';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss'
})
export class NewTaskComponent implements OnInit {


  constructor(private taskservice: TaskService, private route: ActivatedRoute, private router: Router) {}

  listId!: string;

  ngOnInit() {
    // Keeping track of the currtly selected list
    this.route.params.subscribe((params: Params) => {
      this.listId = params['listId'];
      })
    }

  

  CreateTask(title: string) {
    this.taskservice.createTask(title, this.listId).subscribe(next => {
      const newTask:task = next as task;
      this.router.navigate(['../'], {relativeTo: this.route});

    })
  }

}
