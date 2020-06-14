import { collatedTasks, collatedPriority, collatedSection } from "./constants";
import User from "../models/User";

const isEmpty = (string: string | undefined) => {
  if (string !== undefined && string.trim() === "") return true;
  return false;
};
const isEmail = (email: string) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
};

export const validateSignupData = (data: User) => {
  let errors = <Error>{};
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (!isEmpty(data.email)) errors.email = "Must be a valid email address";
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(data.handle)) errors.handle = "Must not be empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

export const validateLoginData = (data: User) => {
  let errors = <Error>{};

  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (isEmail(data.password)) errors.password = "Must not be empty";
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

export const collatedTasksExist = (selectedProject) => {
  return collatedTasks.find((task) => task.name === selectedProject);
};

export const collatedPriorityExist = (selectedPriority: string) => {
  return collatedPriority.find(
    (priority) => priority.name === selectedPriority
  );
};

export const collatedSectionExist = (selectedSection) => {
  return collatedSection.find((section) => section.name === selectedSection);
};

interface Error {
  email?: string;
  password?: string;
  confirmPassword?: string;
  handle?: string;
}
