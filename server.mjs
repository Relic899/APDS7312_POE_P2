import https from "https";
import fs from "fs";
import users from "./routes/user.mjs";
import payments from "./routes/payment.mjs"
import staff from "./routes/staff.mjs"
import express from "express";
import cors from "cors";
//Import and install helmet package to enforce HTTP Strict Transport Security (HSTS)
//Installation : npm install express-rate-limit
import helmet from "helmet";
//Import and install rate limit package to protect against denial of service attacks
//Installation : npm install express-rate-limit
import rateLimit from 'express-rate-limit';

//npm install dotenv for access to jwt secret from .env
import dotenv from 'dotenv';
dotenv.config();

const PORT = 3001;  // HTTPS port

const app = express();

//Addition of rate limiting to protect the system against ddos attacks by limiting request amounts per IP address in a time period
// Apply a rate limit of 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// SSL options
const options = {
    key: fs.readFileSync("keys/privatekey.pem"),
    cert: fs.readFileSync("keys/certificate.pem")
};

// Redirect HTTP to HTTPS middleware
const forceSSL = (req, res, next) => {
    if (req.secure) {
        // If request is already secure, proceed
        return next();
    } else {
        // If not secure, redirect to the HTTPS equivalent
        res.redirect(`https://${req.headers.host}${req.url}`);
    }
};
//--------------------------------------------------------------------------------------------------------
//Application .use calls are set up due to :

// 1) Force HTTPS redirection (forceSSL) should be first, to ensure all traffic is secure from the start.
// 2) Helmet middleware for security headers, including HSTS.
// 3) CORS and JSON middleware to handle cross-origin requests and parse JSON bodies.
// 4) Rate limiting should be applied after CORS to ensure that rate limits are enforced on the incoming requests.
// 5) Custom headers (like X-Frame-Options) can be set after rate limiting.
//--------------------------------------------------------------------------------------------------------

// Apply forceSSL middleware before anything else for HTTPS redirection
app.use(forceSSL);

//Configuration for Strictly HTTPS on browser
// Use Helmet for security headers
app.use(helmet());


// Custom Content Security Policy for counteracting click jacking
app.use(helmet.contentSecurityPolicy({
    directives: {
      frameAncestors: ["'none'"], // Prevents the page from being framed
      defaultSrc: ["'self'"], //Content from Own domain is allowed to run
      scriptSrc: ["'self'", "https://localhost:3001/"], //Java script can run from this specific trusted website source
      styleSrc: ["'self'", "https://fonts.googleapis.com"], //Style sheet scripts can run from this trusted website source
    },
  }));
  
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));


// Configure HSTS
app.use(helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Enable HSTS for all subdomains
    preload: true // Allow browsers to preload this HSTS policy
}));


// CORS and JSON middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting middleware
app.use(limiter);

// Set headers
app.use((req, res, next) => {
    //X-Frame-Options is used to prevent our website from being embedded in another site for clickjacking attacks
    //Deny will not allow any sites to embed the website into any iframes at all
    //SAMEORIGIN Will allow sites to embed the website in other frames from the same domain
    res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // or 'DENY', will swap to deny if we arent using iframes to display content in gui
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    next();
});

// Routes
app.use("/user", users);
app.use("/payment",payments);
app.use("/staff",staff);
// Start HTTPS server
let httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, () => {
    console.log(`HTTPS Server running on port ${PORT}`);
});