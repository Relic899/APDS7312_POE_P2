import jwt from 'jsonwebtoken'

// Access the JWT_Secret from environment variables
const jwtSecret = process.env.JWT_Secret;

const checkauth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, jwtSecret)
        next(); // passes control to the next handler
    } catch(error) {
        res.status(401).json({
            message: 'token invalid'
        });
    }
};

export default checkauth;
// only needed for when the user actually logs into the system. 