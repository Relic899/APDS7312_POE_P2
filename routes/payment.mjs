import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import inputValidationCustomerPayment from "../inputValidationCustomerPayment.mjs";

const router = express.Router();

var store = new ExpressBrute.MemoryStore(); 

//MakePayment
router.post("/MakePayment", inputValidationCustomerPayment, async (req, res) => {
    let newDocument = {
        //Customer specific Payment information needed to submit a payment request
        cp_recipientFullName: req.body.cp_recipientFullName,
        cp_recipientAddress: req.body.cp_recipientAddress,
        cp_recipientCity: req.body.cp_recipientCity,
        cp_recipientPostalCode: req.body.cp_recipientPostalCode,
        cp_recipientCountry: req.body.cp_recipientCountry,
        cp_swiftBankName: req.body.cp_swiftBankName,
        cp_swiftCode: req.body.cp_swiftCode,
        cp_swiftIntBankNumber: req.body.cp_swiftIntBankNumber,
        cp_amount: req.body.cp_amount,
        cp_currency: req.body.cp_currency,
        cp_payReference: req.body.cp_payReference
    };

    let collection = await db.collection("customerPaymentInformation"); //Name of Collection for customer payment information
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204).json({ message: "Successful Insert" });
});

export default router;
