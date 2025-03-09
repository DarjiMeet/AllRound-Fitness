import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    try {
        const owner_token = req.cookies?.owner_token; // Ensure cookies exist

        if (!owner_token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(owner_token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
        }

        req.ownerId = decoded.ownerId;
        next();
    } catch (error) {
        console.error("Error in verify token:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const verifyUserToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token; // Ensure cookies exist

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized - No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized - Invalid token" });
        }

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error("Error in verify user token:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
