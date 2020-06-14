export interface Project {
  name: string;
  created: string;
  userId: string | string[] | undefined;
  priority: string;
  docId?: string;
}

export interface Task {
  task: string;
  date: string;
  projectId: string;
  userId: string | string[] | undefined;
  id?: string;
}
