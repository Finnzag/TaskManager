import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { task } from '../../models/task.model';
import { list } from '../../models/list.model';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrl: './task-view.component.scss'
})

export class TaskViewComponent implements OnInit {

  lists: list[] = [];
  tasks: task[] = [];

  selectedListId: string = "";

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) {}


ngOnInit() {
  this.route.params.subscribe((params: Params) => {
    if (params?.['listId']) {
      this.selectedListId = params['listId'];
      this.taskService.getTasks(params?.['listId']).subscribe((tasks:any) => {
        this.tasks = tasks;
      })

    } else {
      this.tasks = [];
    }
  })

  this.taskService.getLists().subscribe((lists: any) => {
    this.lists = lists

    // Checks to see if there are ant lists in the array. If no lists then the new task button will be disabled
    if (this.lists.length === 0) {
      (<HTMLInputElement> document.getElementById("newTaskButton")).disabled = true;
    } else {
      (<HTMLInputElement> document.getElementById("newTaskButton")).disabled = false;
    }
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

onDeleteTaskClicked(id: string) {
  this.taskService.deleteTask(this.selectedListId, id).subscribe((res: any) => {
    this.tasks = this.tasks.filter(val => val._id !== id);
    console.log(res);
  })
}

onLogoutClicked() {
  // Delete access and refresh token stored in local storage
  localStorage.removeItem('user-id');
  localStorage.removeItem('x-access-token');
  localStorage.removeItem('x-refresh-token');
  
  // Redirect to login page
  this.router.navigate(['/login']);

}

onChangeStatusClicked(task: any, event:any, obj:any) {
  event.stopPropagation();

  
  if (obj.status == "Todo") {
    obj.status = 'In Progress';
  }else if (obj.status == "In Progress"){
    obj.status = 'Completed';
    task.completed = !task.completed;
  }else{
    obj.status = 'Todo';
    task.completed = !task.completed;
  }
  
}

saveTaskInfo(task: any){
  localStorage.setItem('taskNotes', task.notes);
}

}