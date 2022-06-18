import fs from "fs";
import uniqid from "uniqid";

import {
  addBankAccount,
  loadBankAccounts,
} from "./bank-accounts.controller.js";

const loadUsers = () => {
  try {
    const data = fs.readFileSync("./server/users.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const isUserExists = (passportId) => {
  const users = loadUsers();
  const result = users.find((user) => user.passportId === passportId);

  return result;
};

const addNewUser = (passportId, isActive) => {
  const users = loadUsers();

  console.log(passportId);
  users.push({
    passportId,
    isActive,
  });
  fs.writeFileSync("./server/users.json", JSON.stringify(users));
};

export const getAllUsers = () => {
  try {
    const users = loadUsers();
    const bankAccounts = loadBankAccounts();

    const usersDetails = users.map((user) => {
      const userDetailsObj = {
        user,
        banks: bankAccounts[user.passportId],
      };
      return userDetailsObj;
    });

    return usersDetails;
  } catch (error) {
    console.log(error);
  }
};

export const addUser = (body) => {
  try {
    const isExists = isUserExists(body.passportId);
    if (!isExists) {
      const passportId = body.passportId ? body.passportId : uniqid();
      addNewUser(passportId, body.isActive);
      addBankAccount(body, passportId, isExists);
    } else addBankAccount(body, body.passportId, isExists);
  } catch (error) {
    console.log(error);
  }
};

export const getUser = ({ passportId }) => {
  try {
    const isExists = isUserExists(passportId);
    if (!isExists) {
      return "User doesn't Exist";
    } else {
      const users = loadUsers();
      const user = users.find(
        (currentUser) => currentUser.passportId === passportId
      );
      const bankAccounts = loadBankAccounts();
      const userDetails = {
        user,
        banks: bankAccounts[passportId],
      };
      return userDetails;
    }
  } catch (error) {
    console.log(error);
  }
};
