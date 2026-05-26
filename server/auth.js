import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function hashPassword(password){
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
};

export async function validatePassword(password, hashedPassword){
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
};

// ---- Token creation
const JWT_SECRET = "booking-secret";
export function createToken(user){
    return jwt.sign(
        {user_id: user.id, email: user.email, role: user.role},
        JWT_SECRET,
        {expiresIn: "1h"}
    );
}

// ---- AUTH Middleware
export async function auth(req, res, next){
    // Getting the authorization header from the request
    const header = req.headers.authorization;

    if(!header){
        return res.status(401).json({error: "Missing Authorization Header!"});
    }
    // Looking for BEARER token in header
    const [, token] = header.split(" ");
    if(!token){
        return res.status(401).json({error: "token is Missing!"});
    }

    try{
        // Verifing if token is match JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded Token Content:", decoded);
        const user = await prisma.user.findUnique({
            where: {
                id: Number(decoded.user_id) // המרה למספר במידה וה-ID ב-DB הוא Int
            }
});
        
        if(!user){
            return res.status(401).json({message: "user doesn't found"})
        };
        // Save user id in the request and continue
        req.user_id = user.id;
        req.role = user.role;
        console.log(req.user_id, req.role);
        
        next();
    } catch(error) {
    console.error("Auth Middleware Error:", error.message); // זה יגיד לך אם זה "jwt expired" או "invalid signature"
    res.status(401).json({error: "Invalid or expired token!"});
}
};
export function requiredRole(rolesAllowed){

    return function (req, res, next){
        console.log("Role:", req.role);
        if(!req.role){
            console.log("user not found");
            return res.status(401).json({message: "user not found"});
        };
        const isAllowed = rolesAllowed.includes(req.role);
        console.log("is Allowed:", isAllowed);
        if(!isAllowed){
            console.log("access is forbidden");
            return res.status(403).json({message: "access is forbidden"});
        };
        next();
    };
};