import * as functions from "firebase-functions";
import * as express from "express";
import Auth from "./services/fbAuth";
import * as cors from "cors";

import { signup, login, anonimus } from "./controllers/users";
import {
  getProjects,
  createProject,
  deleteProject,
  getTasks,
  createTask,
  deleteTask,
} from "./controllers/tasks";
import {
  getTags,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./controllers/notes";
import {
  listofDoc,
  uploadDoc,
  downloadDoc,
  deleteDoc,
} from "./controllers/files";

export const app = express();
app.use(cors());

// users routs
app.post("/signup", signup);
app.post("/login", login);
app.post("/anonimus", anonimus);

//tasks routs
app.get("/projects", Auth, getProjects);
app.post("/projects", Auth, createProject);
app.delete("/projects/:id", Auth, deleteProject);
app.get("/tasks", Auth, getTasks);
app.post("/tasks", Auth, createTask);
app.delete("/tasks/:id", Auth, deleteTask);

//notes routs
app.get("/tags", Auth, getTags);
app.get("/notes", Auth, getNotes);
app.post("/notes", Auth, createNote);
app.patch("/notes/:id", Auth, updateNote);
app.delete("/notes/:id", Auth, deleteNote);

//files routs
app.get("/clouds", Auth, listofDoc);
app.post("/clouds", Auth, uploadDoc);
app.delete("/clouds/:id", Auth, deleteDoc);
app.post("/download", Auth, downloadDoc);

exports.api = functions.region("europe-west1").https.onRequest(app);
