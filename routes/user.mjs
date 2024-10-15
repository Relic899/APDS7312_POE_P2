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

//signup
router.post("/signup", inputValidationCustomerAccount(['username', 'password', 'c_fullName', 'c_idNumber', 'c_accountNumber']), async (req, res) => {
    const password = bcrypt.hash(req.body.password, 12); //Increased bycrypt cost factor to 12 from 10 , to improve password hashing security for a international payment portal
    let newDocument = {
        //Customer specific information needed to register account
        c_fullName: req.body.c_fullName,
        c_idNumber: req.body.c_idNumber,
        c_accountNumber: req.body.c_accountNumber,

        username: req.body.username,
        password: (await password).toString(),
    };
    let collection = await db.collection("customerInformation"); //Name of Collection for customer specific information
    let result = await collection.insertOne(newDocument);
    res.send(result).status(204);
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


export default router;
