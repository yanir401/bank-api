import fs from "fs";
import uniqid from "uniqid";
import { isUserExists } from "./users.controller.js";

export const loadBankAccounts = () => {
  try {
    const data = fs.readFileSync("./server/bank-accounts.json", "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return [];
  }
};

const saveBankAccounts = (bankAccounts) => {
  try {
    fs.writeFileSync(
      "./server/bank-accounts.json",
      JSON.stringify(bankAccounts)
    );
  } catch (error) {
    console.log(error);
  }
};

const findMaxAvailableToPullAccount = (userBankAccount) => {
  let maxAvailableToPullAccount = userBankAccount[0];
  let maxIndex = 1;

  for (let i = 1; i < userBankAccount.length; i++) {
    console.log(userBankAccount[i].availableToPull);
    if (
      maxAvailableToPullAccount.availableToPull <
      userBankAccount[i].availableToPull
    ) {
      maxAvailableToPullAccount = userBankAccount[i];
      maxIndex = i;
    }
  }
  return { maxIndex, maxAvailableToPullAccount };
};

export const addBankAccount = (body, passportId, isNewUser) => {
  const { cash, credit } = body;
  const bankAccounts = loadBankAccounts();

  const newBankAccount = {
    cash,
    credit,
    availableToPull: credit + cash,
    bankId: uniqid(),
  };

  if (!isNewUser) {
    bankAccounts[passportId] = [newBankAccount];
  } else bankAccounts[passportId].push(newBankAccount);
  saveBankAccounts(bankAccounts);
};

export const deposit = ({ passportId, amount }) => {
  let msg;

  if (amount <= 0) {
    msg = `You must deposit an amount greater than 0`;
  } else if (isUserExists(passportId)) {
    const bankAccounts = loadBankAccounts();
    const userBankAccount = bankAccounts[passportId][0];

    userBankAccount.cash = amount;
    userBankAccount.availableToPull =
      userBankAccount.cash + userBankAccount.credit;

    saveBankAccounts(bankAccounts);
    return `The deposit was received successfully
    Currently available money to withdraw: ${userBankAccount.availableToPull}`;
  } else {
    msg = `Cannot find user with Passport id: ${passportId}`;
  }

  return msg;
};

export const updateCredit = ({ passportId, amount }) => {
  let msg;
  if (amount <= 0) {
    msg = `You must specify an amount greater than 0`;
  } else if (isUserExists(passportId)) {
    const bankAccounts = loadBankAccounts();
    const userBankAccount = bankAccounts[passportId][0];

    userBankAccount.credit = amount;
    userBankAccount.availableToPull =
      userBankAccount.cash + userBankAccount.credit;

    saveBankAccounts(bankAccounts);
    return `The credit was update successfully
    Currently available money to withdraw: ${userBankAccount.availableToPull}`;
  } else {
    msg = `Cannot find user with Passport id: ${passportId}`;
  }

  return msg;
};

const handleWithdraw = (
  collectionOfAccountToWithDraw,
  amount,
  userBankAccount,
  passportId,
  destinationUserPassportId
) => {
  let amountRemain = amount;
  if (collectionOfAccountToWithDraw) {
    collectionOfAccountToWithDraw.forEach((bAccount) => {
      amountRemain -= bAccount.availableToPull;
      if (amountRemain > 0) {
        bAccount.cash -= bAccount.cash;
        bAccount.cash -= bAccount.credit;
        bAccount.availableToPull = bAccount.cash + bAccount.credit;
      } else {
        bAccount.cash = Math.abs(amountRemain) - bAccount.credit;
        bAccount.availableToPull = bAccount.cash + bAccount.credit;
      }
    });
  }
  const bankAccounts = loadBankAccounts();
  bankAccounts[passportId] = userBankAccount;
  saveBankAccounts(bankAccounts);
  return "success";
};

export const withdraw = ({ passportId, amount }) => {
  let msg;
  console.log(typeof amount);
  if (amount <= 0 || typeof amount !== "number") {
    msg = `You must specify an amount greater than 0`;
  } else if (isUserExists(passportId)) {
    const bankAccounts = loadBankAccounts();
    const userBankAccount = bankAccounts[passportId];
    let collectionOfAvailableToPull = 0;
    const indexOfCollection = [];
    const collectionOfAccountToWithDraw = [];

    const { maxIndex, maxAvailableToPullAccount } =
      findMaxAvailableToPullAccount(userBankAccount);
    const bankAccountToWithdraw = userBankAccount.find((bankAccount) => {
      return bankAccount.availableToPull >= amount;
    });
    console.log("bankAccountToWithdraw", bankAccountToWithdraw);
    console.log(maxAvailableToPullAccount);
    if (!bankAccountToWithdraw) {
      indexOfCollection.push(maxIndex);

      collectionOfAccountToWithDraw.push(maxAvailableToPullAccount);
      console.log("222", maxAvailableToPullAccount);
      collectionOfAvailableToPull += maxAvailableToPullAccount.availableToPull;

      for (const [index, bankAccount] of userBankAccount.entries()) {
        console.log("maxIndex", maxIndex);
        if (bankAccount.bankId !== maxAvailableToPullAccount.bankId) {
          collectionOfAccountToWithDraw.push(bankAccount);
          collectionOfAvailableToPull += bankAccount.availableToPull;
          indexOfCollection.push(index);
          console.log(collectionOfAvailableToPull);
        }

        if (collectionOfAvailableToPull >= amount) {
          break;
        }
      }
    } else
      msg = handleWithdraw(
        [bankAccountToWithdraw],
        amount,
        userBankAccount,
        passportId
      );

    if (collectionOfAvailableToPull < amount && !bankAccountToWithdraw)
      return (
        "Not enough money You may want to consider taking out a loan" +
        collectionOfAvailableToPull
      );
    else if (collectionOfAvailableToPull >= amount)
      console.log("es", collectionOfAccountToWithDraw);
    msg = handleWithdraw(
      collectionOfAccountToWithDraw,
      amount,
      userBankAccount,
      passportId
    );
  } else {
    msg = `Cannot find user with Passport id: ${passportId}`;
  }

  return msg;
};

export const transfer = ({ passportId, destinationUserPassportId, amount }) => {
  let msg;

  if (amount <= 0 || typeof amount !== "number") {
    msg = `You must specify an amount greater than 0`;
  } else if (
    isUserExists(passportId) &&
    isUserExists(destinationUserPassportId)
  ) {
    const bankAccounts = loadBankAccounts();
    const sourceBankAccounts = bankAccounts[passportId];
    const destinationBankAccounts = bankAccounts[destinationUserPassportId];
    const sourceBankAccountsToWithdraw = sourceBankAccounts.find(
      (bankAccount) => bankAccount.availableToPull >= amount
    );
    if (!sourceBankAccountsToWithdraw) {
      const collectionOfAccountToWithDraw = [];
      let collectionOfAvailableToPull = 0;

      for (const [index, bankAccount] of sourceBankAccounts.entries()) {
        collectionOfAccountToWithDraw.push(bankAccount);
        collectionOfAvailableToPull += bankAccount.availableToPull;
        // indexOfCollection.push(index);
        console.log(collectionOfAvailableToPull);

        if (collectionOfAvailableToPull >= amount) {
          break;
        }
      }

      if (collectionOfAvailableToPull >= amount) {
        msg = handleWithdraw(
          collectionOfAccountToWithDraw,
          amount,
          sourceBankAccounts,
          passportId,
          destinationUserPassportId
        );

        if (msg) {
          destinationBankAccounts[0].cash += amount;
          destinationBankAccounts[0].availableToPull =
            destinationBankAccounts[0].cash + destinationBankAccounts[0].credit;

          saveBankAccounts(bankAccounts);
          msg = `Transfer success source Bank Accounts balance ${
            collectionOfAvailableToPull - amount
          }  destination Bank Account 
          balance ${destinationBankAccounts[0].availableToPull}`;
        }
      } else
        return (
          "Not enough money You may want to consider taking out a loan " +
          collectionOfAvailableToPull
        );
    } else {
      msg = handleWithdraw(
        [sourceBankAccountsToWithdraw],
        amount,
        sourceBankAccounts,
        passportId,
        destinationUserPassportId
      );
    }
  }
  return msg;
};
