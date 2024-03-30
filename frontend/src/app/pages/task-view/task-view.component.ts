import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params } from '@angular/router';
import { task } from '../../models/task.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent implements OnInit {

  lists: any;
  tasks: any;

  constructor(private taskService: TaskService, private route: ActivatedRoute) {}


ngOnInit() {
  this.route.params.subscribe((params: Params) => {
    this.taskService.getTasks(params?.['listId']).subscribe((tasks:Object) => {
      this.tasks = tasks;
    })
  })

  this.taskService.getLists().subscribe((lists: Object) => {
    this.lists = lists
  })

}

onTaskClick(task: any) {
  this.taskService.complete(task).subscribe(() => {
    console.log("completed successfully");
    // Task has been set to completed 
    task.completed = !task.completed;
  })
}

}
