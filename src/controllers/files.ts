import { Request, Response } from "express";

import { db, cloud } from "../services/admin";
import config from "../services/config";
import * as moment from "moment";
import * as BusBoy from "busboy";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { File, FileData } from "../models/File";

export const listofDoc = async (req: Request, res: Response) => {
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  try {
    const data = await db
      .collection("cloud")
      .where("userId", "==", req.headers.userid)
      .get();
    const lists = data.docs.map((_doc) => ({
      ..._doc.data(),
      docId: _doc.id,
    }));
    return res.status(200).json(lists);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error });
  }
};
export const uploadDoc = async (req: Request, res: Response) => {
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  const busboy = new BusBoy({
    headers: req.headers,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  let originalFileName: string;
  let docFileName: string;
  let docToBeUploaded = <File>{};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    originalFileName = filename;
    docFileName = `${Date.now()}_${filename}`;
    const filepath = path.join(os.tmpdir(), docFileName);
    docToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", async () => {
    try {
      const [data] = await cloud
        .bucket(config.storageBucket)
        .upload(docToBeUploaded.filepath, {
          resumable: false,
          metadata: {
            metadata: {
              contentType: docToBeUploaded.mimetype,
            },
          },
        });
      console.log("data", data.metadata.size);
      const fileData: FileData = {
        path: "/",
        created: moment().format("YYYY/MM/DD"),
        name: originalFileName,
        docFileName: docFileName,
        size: `${Math.round(data.metadata.size / 1000)} kb`,
        userId: req.headers.userid,
      };
      const uploadedFile = await db.collection("cloud").add(fileData);
      fileData.docId = uploadedFile.id;
      return res.status(200).json(fileData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "something went wrong" });
    }
  });

  busboy.end(req.rawBody);
};
export const deleteDoc = async (req: Request, res: Response) => {
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  const file = db.doc(`/cloud/${req.params.id}`);
  try {
    const doc = await file.get();
    const data = doc.data();
    if (!doc.exists) return res.status(404).json({ error: "File not found" });
    if (!data) return;
    if (data.userId !== req.headers.userid)
      return res.status(403).json({ error: "Forbidden" });
    file.delete();
    await cloud.bucket(config.storageBucket).file(data.docFileName).delete();
    return res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error });
  }
};
export const downloadDoc = async (req: Request, res: Response) => {
  if (req.headers.userid === undefined) {
    console.log("UserId = undefined");
    return res.status(400).json({ error: "UserId = undefined" });
  }
  const { docFileName } = req.body;
  const options = {
    version: "v4",
    action: "read",
    expires: Date.now() + 15 * 60 * 1000,
  };
  try {
    const [url] = await cloud
      .bucket(config.storageBucket)
      .file(docFileName)
      .getSignedUrl(options);
    return res.status(200).json(url);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ error });
  }
};
