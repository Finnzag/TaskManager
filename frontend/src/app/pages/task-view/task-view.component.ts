import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { task } from '../../models/task.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})
export class TaskViewComponent implements OnInit {

  lists: any;
  tasks: any;

  selectedListId: string = "";

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {}


ngOnInit() {
  this.route.params.subscribe((params: Params) => {
    if (params?.['listId']) {
      this.selectedListId = params['listId'];
      this.taskService.getTasks(params?.['listId']).subscribe((tasks:Object) => {
        this.tasks = tasks;
      })
    } else {
      this.tasks = undefined;
    }
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

onDeleteListClicked() {
  this.taskService.deleteList(this.selectedListId).subscribe((res: any) => {
    this.router.navigate(['/lists']);
    console.log(res);
  })
}

}
