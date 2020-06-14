import { Request, Response } from "express";
import { db } from "../services/admin";
import config from "../services/config";
import * as moment from "moment";
import * as firebase from "firebase";
firebase.initializeApp(config);

import { validateSignupData, validateLoginData } from "../services/validators";
import User from "../models/User";

export const signup = async (req: Request, res: Response) => {
  const { email, password, confirmPassword, handle } = req.body;
  const newUser: User = { email, password, confirmPassword, handle };

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  try {
    const doc = await db.doc(`/users/${newUser.handle}`).get();
    if (doc.exists)
      return res.status(400).json({ handle: "This handle is already taken" });
    const data = await firebase
      .auth()
      .createUserWithEmailAndPassword(newUser.email, newUser.password);
    if (data.user === null)
      return res.status(500).json({ error: "Something went wrong" });

    const idToken = await data.user.getIdToken();

    const userCredentials = {
      handle,
      email,
      createdAt: new Date().toISOString(),
      userId: data.user.uid,
    };

    await db.doc(`/users/${newUser.handle}`).set(userCredentials);
    return res.status(201).json({ idToken });
  } catch (error) {
    console.error("Register", error);

    if (error.code === "auth/email-already-in-use")
      return res.status(400).json({ email: "Email is already in use" });
    return res.status(500).json({ error: error.code });
  }
};
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user: User = { email, password };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  try {
    const data = await firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password);
    if (data.user === null)
      return res.status(500).json({ error: "Something went wrong" });
    const token = await data.user.getIdToken();
    return res.status(200).json({ token });
  } catch (error) {
    if (error.code === "auth/wrong-password") {
      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    }
    return res.status(500).json({ error: error.code });
  }
};
export const anonimus = async (req: Request, res: Response) => {
  try {
    const data = await firebase.auth().signInAnonymously();
    if (data.user === null)
      return res.status(500).json({ error: "SSomething went wrong" });
    const userCredentials = {
      created: moment().format("h:mm:ss DD/MM/YYYY"),
      userId: data.user.uid,
    };
    await db.collection("users").add(userCredentials);
    const token = await data.user.getIdToken();
    return res.status(200).json({ token });
  } catch (error) {
    return res.status(500).json({ error: error.code });
  }
};
