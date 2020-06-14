export interface File {
  filepath: string;
  mimetype: string;
}

export interface FileData {
  path: string;
  created: string;
  name: string;
  docFileName: string;
  size: string;
  userId: string | string[] | undefined;
  docId?: string;
}
