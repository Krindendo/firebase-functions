import { Request, Response } from "express";
import * as admin from "firebase-admin";
import { db } from "./admin";

const Auth = async (req: Request, res: Response, next: () => any) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const data = await db
      .collection("users")
      .where("userId", "==", decodedToken.uid)
      .limit(1)
      .get();
    decodedToken.handle = data.docs[0].data().handle;
    return next();
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(403).json(error);
  }
};

export default Auth;
