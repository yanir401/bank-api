import express from "express";
import userRoute from "./routes/users.route.js";
import bankAccountsRoute from "./routes/bank-accounts.route.js";
const app = express();
app.use(express.json());

app.use(userRoute);
app.use(bankAccountsRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, (error) => {
  if (error) console.log(error);
  else console.log(`Server is up and running on port ${PORT}`);
});
