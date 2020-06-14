import { Request, Response } from "express";

import { db } from "../services/admin";
import {
  collatedTasksExist,
  collatedPriorityExist,
} from "../services/validators";
import { collatedPriority } from "../services/constants";
import * as moment from "moment";
import { Project, Task } from "../models/Note";

//Projects
export const getProjects = async (req: Request, res: Response) => {
  const priority = req.query.priority?.toString();
  //Ovo iznad proveri
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  let subscribe = db
    .collection("projects")
    .where("userId", "==", req.headers.userid);

  if (priority && collatedPriorityExist(priority)) {
    collatedPriority.forEach((element) => {
      if (priority === element.name) {
        subscribe = subscribe.where("priority", "==", priority);
      }
    });
  }

  try {
    const data = await subscribe.orderBy("created", "asc").get();
    const projects = data.docs.map((project) => ({
      ...project.data(),
      docId: project.id,
    }));
    return res.status(200).json(projects);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.code });
  }
};
export const creatProject = async (req: Request, res: Response) => {
  const { name, priority }: { name: string; priority: string } = req.body;
  if (name.trim() === "")
    return res.status(400).json({ body: "Name must not be empty" });

  if (priority.trim() === "")
    return res.status(400).json({ priority: "Priority must not be empty" });

  if (!collatedPriorityExist(priority))
    return res.status(400).json({ priority: "Wrong priority name" });

  const newProject: Project = {
    name,
    created: moment().format("YYYY/MM/DD"),
    userId: req.headers.userid,
    priority: priority.toLowerCase(),
  };
  try {
    const ref = await db.collection("projects").add(newProject);
    newProject.docId = ref.id;
    return res.status(200).json(newProject);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
export const deleteProject = async (req: Request, res: Response) => {
  const projectId = req.params.id.toString();
  const document = db.doc(`/projects/${projectId}`);

  try {
    const doc = await document.get();
    if (!doc.exists) throw new TypeError("Project not found");
    document.delete();
  } catch (error) {
    return res.status(404).json({ error });
  }

  try {
    const doc = await db
      .collection("tasks")
      .where("projectId", "==", projectId)
      .get();

    try {
      let batch = db.batch();
      doc.docs.forEach((task) => {
        batch.delete(task.ref);
      });
      await batch.commit();
      return res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Tasks didnt deleted" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

//Tasks
export const getTasks = async (req: Request, res: Response) => {};
export const creatTask = async (req: Request, res: Response) => {};
export const deleteTask = async (req: Request, res: Response) => {};
