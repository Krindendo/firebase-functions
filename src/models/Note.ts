interface Note {
  body: string;
  created: string;
  section: string;
  title: string;
  userId: string | string[] | undefined;
  docId?: string;
}

export default Note;
