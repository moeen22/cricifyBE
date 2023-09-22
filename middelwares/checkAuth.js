import jwt from 'jsonwebtoken';

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const uid = req.body.uid || req.query.uid;
        console.log(uid);
        if (decoded.userId !== uid) return res.status(401).json({ message: 'Auth failed' });
        req.userData = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Auth failed' });
    }
};

export const resetAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET_RESET);
        const uid = req.body.uid || req.query.uid;
        console.log(uid);
        if (decoded.userId !== uid) return res.status(401).json({ message: 'Auth failed' });
        req.userData = decoded;
        next();
    } catch (err) {
        console.log(err);
        res.status(401).json({ message: 'Auth failed' });
    }
};

export default checkAuth;

// This is for user
