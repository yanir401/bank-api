import express from "express";
import {
  deposit,
  transfer,
  updateCredit,
  withdraw,
} from "../controllers/bank-accounts.controller.js";
// import { addUser, getAllUsers } from "../controllers/users.controller.js";
const router = express.Router();

router.patch("/deposit", (req, res) => {
  res.send(deposit(req.body));
});

router.patch("/credit", (req, res) => {
  res.send(updateCredit(req.body));
});

router.patch("/withdraw", (req, res) => {
  res.send(withdraw(req.body));
});

router.patch("/transfer", (req, res) => {
  res.send(transfer(req.body));
});

export default router;
