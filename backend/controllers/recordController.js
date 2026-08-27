import Record from '../models/Record.js';
import calculateAge from '../utils/calculateAge.js';

export const createRecord = async (req, res, next) => {
  try {
    const { name, dateOfBirth } = req.body;

    // Server-side validation
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name is required and must be at least 2 characters.' });
    }

    if (!dateOfBirth) {
      return res.status(400).json({ message: 'Date of birth is required.' });
    }

    const dobDate = new Date(dateOfBirth);
    if (isNaN(dobDate.getTime())) {
      return res.status(400).json({ message: 'Invalid Date of Birth format.' });
    }

    const today = new Date();
    if (dobDate > today) {
      return res.status(400).json({ message: 'Date of birth cannot be in the future.' });
    }

    // Save record to the database
    const newRecord = new Record({
      name: name.trim(),
      dateOfBirth: dobDate,
    });
    await newRecord.save();

    // Calculate age dynamically
    const age = calculateAge(dobDate);

    // Return only the success message and calculated age to prevent data leakage
    res.status(201).json({
      message: 'Age calculated and details submitted successfully.',
      age,
    });
  } catch (error) {
    next(error);
  }
};
