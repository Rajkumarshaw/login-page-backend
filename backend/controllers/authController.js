import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find admin and explicitly include password field
    const admin = await Admin.findOne({ email }).select('+password');

    // Return generic message if email or password is wrong
    const invalidCredsMessage = 'Invalid administrator credentials.';

    if (!admin) {
      return res.status(401).json({ message: invalidCredsMessage });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: invalidCredsMessage });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Set JWT as HTTP-only cookie
    res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000,
});

    res.json({
      message: 'Login successful.',
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie('token', '', {
  httpOnly: true,
  expires: new Date(0),
  secure: true,
  sameSite: 'none',
});

    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: 'Administrator profile not found.' });
    }
    res.json({
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
