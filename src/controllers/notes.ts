import { Request, Response } from "express";
import { db } from "../services/admin";
import * as moment from "moment";
import Note from "../models/Note";

export const getTags = async (req: Request, res: Response) => {
  try {
    const ref = await db.collection("tags").get();
    const tags = ref.docs.map((_ref) => ({
      ..._ref.data(),
    }));
    return res.status(200).json(tags);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong " });
  }
};

export const getNotes = async (req: Request, res: Response) => {
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    res.status(400).json({ error: "UserId = undefined" });
  }
  try {
    const serverUpdate = await db
      .collection("notes")
      .where("userId", "==", req.headers.userid)
      .get();
    const notes = serverUpdate.docs.map((_doc) => ({
      ..._doc.data(),
      docId: _doc.id,
    }));
    return res.status(200).json(notes);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong " });
  }
};

export const createNote = async (req: Request, res: Response) => {
  const { body, section, title } = req.body;
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  if (body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty " });
  }
  if (!Number.isInteger(section)) {
    return res.status(400).json({ section: "Section must be integer" });
  }
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title must not be empty " });
  }

  const newNote: Note = {
    body,
    created: moment().format("YYYY/MM/DD"),
    section,
    title,
    userId: req.headers.userid,
  };

  try {
    const ref = await db.collection("notes").add(newNote);
    newNote.docId = ref.id;
    return res.status(200).json(newNote);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  const note = db.doc(`/notes/${req.params.id}`);
  const { body, section, title } = req.body;

  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  if (body.trim() === "") {
    return res.status(400).json({ body: "Body must not be empty " });
  }
  if (!Number.isInteger(section)) {
    return res.status(400).json({ section: "Section must be integer" });
  }
  if (title.trim() === "") {
    return res.status(400).json({ title: "Title must not be empty " });
  }

  let updateNote: Note = {
    body,
    created: moment().format("YYYY/MM/DD"),
    section,
    title,
    userId: req.headers.userid,
  };

  try {
    await note.update(updateNote);
    updateNote.docId = req.params.id;
    return res.status(200).json(updateNote);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  const note = db.doc(`/notes/${req.params.id}`);

  try {
    const doc = await note.get();
    if (!doc.exists) return res.status(404).json({ error: "Note not found" });
    await note.delete();
    return res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
