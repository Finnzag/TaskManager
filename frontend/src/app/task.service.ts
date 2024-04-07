import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { task } from './models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webReqService: WebRequestService) { }

  getLists() {
    // send a wbe request to get all lists
    return this.webReqService.get('lists');
  }

  createList(title: string) {
    // send a web request to create a list
    return this.webReqService.post('lists', {title});
  }

  updateList(id: string, title: string) {
    // send a web request to create a list
    return this.webReqService.patch(`lists/${id}`, {title});
  }

  deleteList(id: string) {
    return this.webReqService.delete(`lists/${id}`)
  }

  getTasks(listId: string) {
    return this.webReqService.get(`lists/${listId}/tasks`);
  }

  createTask(title: string, listId: string) {
    // send a web request to create a task
    return this.webReqService.post(`lists/${listId}/tasks`, {title});
  }

  complete(task:any) {
    return this.webReqService.patch(`lists/${task._listId}/tasks/${task._id}`, {
      completed: !task.completed
    })
  }

  

}
