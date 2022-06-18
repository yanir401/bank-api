import express from "express";
import {
  addUser,
  getAllUsers,
  getUser,
} from "../controllers/users.controller.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send(getAllUsers());
});

router.post("/users", (req, res) => {
  res.send(addUser(req.body));
});

router.get("/users/active", (req, res) => {
  console.log(req.body);
  res.send("s");
});

router.get("/users/nonactive", (req, res) => {
  console.log(req.body);
  res.send("s");
});

router.get("/user", (req, res) => {
  res.send(getUser(req.body));
});

// Filter the users
// 1. Can fetch users by the amount of cash they have.  GET > Greater than
// 2. Think of something else to filter. ascending descending

// Ninja:
// Add a new field for a user: IsActive
// IsActive determines if the account is active or not.

// 1. If the user is not active, you cannot do anything with that user
// 2. Fetch the users that are active and have a specified amount of cash. GET

export default router;
