import jwt from 'jsonwebtoken';
   import Admin from '../models/Admin.js';

   const authMiddleware = async (req, res, next) => {
     try {
       // Read token from HTTP-only cookie
       const token = req.cookies.token;

       if (!token) {
         return res.status(401).json({ message: 'Authentication required. No token provided.' });
       }

       // Verify JWT
       const decoded = jwt.verify(token, process.env.JWT_SECRET);

       // Fetch admin matching ID to verify they still exist
       const admin = await Admin.findById(decoded.id);
       if (!admin) {
         return res.status(401).json({ message: 'Authentication failed. Administrator not found.' });
       }

       // Attach user details to request object
       req.user = {
         id: admin._id,
         email: admin.email,
         role: admin.role,
       };

       next();
     } catch (error) {
       console.error('Authentication error:', error.message);
       return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
     }
   };

   export default authMiddleware;
