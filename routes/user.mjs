import express from "express";
import db from "../db/conn.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import ExpressBrute from "express-brute";
import inputValidationCustomerAccount from "../inputValidationCustomerAccount.mjs";

const router = express.Router();

var store = new ExpressBrute.MemoryStore(); 
var bruteforce = new ExpressBrute(store);

// Access the JWT_Secret from environment variables
const jwtSecret = process.env.JWT_Secret;

// Signup route
router.post("/signup", inputValidationCustomerAccount(['username', 'password', 'c_fullName', 'c_idNumber', 'c_accountNumber']), async (req, res) => {
    try {
        // Hash the password with a cost factor of 12
        const hashedPassword = await bcrypt.hash(req.body.password, 12);
        
        // Prepare the new document for insertion
        let newDocument = {
            c_fullName: req.body.c_fullName,
            c_idNumber: req.body.c_idNumber,
            c_accountNumber: req.body.c_accountNumber,
            username: req.body.username,
            password: hashedPassword,
        };

        // Insert the new document into the collection
        let collection = await db.collection("customerInformation");
        let result = await collection.insertOne(newDocument);

        // Check if insertion was successful
        if (result.insertedId) {
            // Send success message if insertion is successful
            return res.status(200).json({ message: "Signup successful" });
        } else {
            return res.status(500).json({ message: "Failed to register user. Please try again." });
        }
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "An error occurred during signup. Please try again." });
    }
});

//login
router.post("/login", bruteforce.prevent, inputValidationCustomerAccount(['username','c_accountNumber', 'password']), async (req, res) => {
    const { username, c_accountNumber ,password } = req.body;
    try {
        const collection = await db.collection("customerInformation");
        const user = await collection.findOne({username});
        const accountNum = await collection.findOne({c_accountNumber})

        //Testing file is found:
        console.log("");
        console.log("Test:");
        console.log("user:" + user);
        console.log("accountnumber:" + accountNum);
        console.log("");
        if (!user || !accountNum) {
            console.log("Authentication failed : You are not registered in the system");
            return res.status(401).json({ message: "Authentication failed : You are not registered in the system" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        //Compare the Account number from the database and the account number entered
        const accountNumberMatch = accountNum.c_accountNumber === user.c_accountNumber;
        if (!passwordMatch || !accountNumberMatch) {
            console.log("Authentication failed : (Comparison between password and account number does not match data on record)");
            return res.status(401).json({ message: "Authentication failed : (Comparison between password and account number does not match data on record)" });
        } else {
            // Authentication successful
            const token = jwt.sign(
                { username: req.body.username, c_accountNumber: req.body.c_accountNumber ,password: req.body.password },
                jwtSecret, //jwtSecret is stored in the .env file , to prevent access to the unique code for signing tokens from being stolen.
                { expiresIn: "1h" }
            );

            //Creation of cookie using the token constant, will store the token in http only , protecting from session jacking
            res.cookie('token',token,{
                httpOnly: true, //Prevents java script from accessing the cookie
                secure: true, //Set the cookie to only be transmitted over https or hsts connections to prevent data interception of session token
                sameSite: 'strict', //Cookie is only accessible by the origin site
                maxAge: 3600000 //1 hour in seconds
            });


            res.status(200).json({ message: "Authentication successful", token, name: req.body.username });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});


// Staff Login
router.post("/staffLogin", bruteforce.prevent, inputValidationCustomerAccount(['username', 'password']), async (req, res) => {
    const { username, password } = req.body;
    try {
        const collection = await db.collection("customerInformation");
        const user = await collection.findOne({ username });

        // Testing file is found:
        console.log("\nTest:");
        console.log("user:", user);
        console.log("");

        // Check if user exists
        if (!user) {
            console.log("Authentication failed: You are not registered in the system");
            return res.status(401).json({ message: "Authentication failed: You are not registered in the system" });
        }

        // Compare the provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("Authentication failed: Incorrect password");
            return res.status(401).json({ message: "Authentication failed: Incorrect password" });
        }

        // Authentication successful
        const token = jwt.sign(
            { username: user.username },
            jwtSecret,
            { expiresIn: "1h" }
        );

        // Create an HTTP-only cookie with the token
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        res.status(200).json({ message: "Authentication successful", token, name: user.username });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
    }
});

export default router;
