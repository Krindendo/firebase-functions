import * as functions from "firebase-functions";
import * as express from "express";
import { FBAuth } from "./services/fbAuth";
import * as cors from "cors";

import { signup, login, anonimus } from "./controllers/users";
import {
  getProjects,
  creatProject,
  deleteProject,
  getTasks,
  creatTask,
  deleteTask,
} from "./controllers/tasks";
import {
  getTags,
  getNotes,
  creatNote,
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
app.get("/projects", FBAuth, getProjects);
app.post("/projects", FBAuth, creatProject);
app.delete("/projects/:id", FBAuth, deleteProject);
app.get("/tasks", FBAuth, getTasks);
app.post("/tasks", FBAuth, creatTask);
app.delete("/tasks/:id", FBAuth, deleteTask);

//notes routs
app.get("/tags", FBAuth, getTags);
app.get("/notes", FBAuth, getNotes);
app.post("/notes", FBAuth, creatNote);
app.patch("/notes/:id", FBAuth, updateNote);
app.delete("/notes/:id", FBAuth, deleteNote);

//files routs
app.get("/clouds", FBAuth, listofDoc);
app.post("/clouds", FBAuth, uploadDoc);
app.delete("/clouds/:id", FBAuth, deleteDoc);
app.post("/download", FBAuth, downloadDoc);

exports.api = functions.region("europe-west1").https.onRequest(app);
