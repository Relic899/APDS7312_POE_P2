import express from "express";
import db from "../db/conn.mjs";
import ExpressBrute from "express-brute";
import inputValidationCustomerPayment from "../inputValidationCustomerPayment.mjs";
import checkauth from "../check-auth.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

var store = new ExpressBrute.MemoryStore(); 

// MakePayment route
router.post("/MakePayment", checkauth, inputValidationCustomerPayment, async (req, res) => {
    try {
        // Prepare the new document for insertion
        let newDocument = {
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
            cp_payReference: req.body.cp_payReference,
        };

        // Insert the new payment document into the collection
        let collection = await db.collection("customerPaymentInformation");
        let result = await collection.insertOne(newDocument);

        // Check if insertion was successful
        if (result.insertedId) {
            // Send success message along with the generated ID
            return res.status(200).json({ 
                message: "Payment request submitted successfully.", 
                paymentId: result.insertedId 
            });
        } else {
            // Send error message if insertion failed
            return res.status(500).json({ message: "Failed to submit payment request. Please try again." });
        }
    } catch (error) {
        console.error("Payment error:", error);
        return res.status(500).json({ message: "An error occurred while processing your payment. Please try again." });
    }
});

// Get all payment records for verification without check Auth
router.get("/getPayments", checkauth, async (req, res) => {
    try {
        // Fetch the collection from the database
        let collection = await db.collection("customerPaymentInformation");
        
        // Retrieve all the records
        let transactions = await collection.find().toArray();
        
        // Send the retrieved transactions as a response
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Failed to fetch transactions:", error);
        res.status(500).json({ message: "An error occurred while fetching transactions." });
    }
});

// Route to delete a payment using _id
router.delete("/deletePayment/:id", checkauth, async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the collection
        let collection = await db.collection("customerPaymentInformation");

        // Delete the transaction based on the _id
        const result = await collection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount > 0) {
            res.status(200).json({ message: "Transaction successfully deleted." });
        } else {
            res.status(404).json({ message: "Transaction not found." });
        }
    } catch (error) {
        console.error("Error deleting transaction:", error);
        res.status(500).json({ message: "An error occurred while deleting the transaction." });
    }
});

// Function to insert payment into "swiftVerifiedPayment" collection
router.post("/submitToSwift", checkauth,async (req, res) => {
    try {
        // Prepare the new document for insertion
        const newDocument = {
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
            cp_payReference: req.body.cp_payReference,
        };

        // Insert the new payment document into the "swiftVerifiedPayment" collection
        const collection = await db.collection("swiftVerifiedPayment");
        const result = await collection.insertOne(newDocument);

        // Check if insertion was successful
        if (result.insertedId) {
            return res.status(200).json({
                message: "Payment successfully submitted to SWIFT.",
                paymentId: result.insertedId,
            });
        } else {
            return res.status(500).json({ message: "Failed to submit payment to SWIFT." });
        }
    } catch (error) {
        console.error("Error while submitting to SWIFT:", error);
        return res.status(500).json({ message: "An error occurred while processing your request." });
    }
});


export default router;