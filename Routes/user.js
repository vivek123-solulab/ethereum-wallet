import express from "express"
import {createSignIn, createUser, transfer, getBalance, getTransactionDetailsEvent} from "../Controllers/user.js";

const router = express.Router()


router.post("/signup", createUser);
router.post("/signin", createSignIn);
router.post("/transferAmount", transfer);
router.get("/getBalance", getBalance);
router.get("/getTransactionDetailsEvent", getTransactionDetailsEvent);

export default router;