export interface Project {
  name: string;
  created: string;
  userId: string | string[] | undefined;
  priority: string;
  docId?: string;
}

export interface Task {
  name: string;
  created: string;
  userId: string | string[] | undefined;
  priority: string;
  docId?: string;
}
