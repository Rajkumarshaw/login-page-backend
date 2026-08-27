import Record from '../models/Record.js';
import calculateAge from '../utils/calculateAge.js';

export const getRecords = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    // Apply Search
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Determine Sort Options
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort) {
      switch (sort) {
        case 'newest':
          sortOptions = { createdAt: -1 };
          break;
        case 'oldest':
          sortOptions = { createdAt: 1 };
          break;
        case 'name-asc':
          sortOptions = { name: 1 };
          break;
        case 'name-desc':
          sortOptions = { name: -1 };
          break;
        case 'age-asc': // Youngest first means the highest (most recent) DOB
          sortOptions = { dateOfBirth: -1 };
          break;
        case 'age-desc': // Oldest first means the lowest (oldest) DOB
          sortOptions = { dateOfBirth: 1 };
          break;
      }
    }

    const records = await Record.find(query).sort(sortOptions);

    // Calculate age for each record dynamically
    const processedRecords = records.map((record) => {
      const age = calculateAge(record.dateOfBirth);
      return {
        _id: record._id,
        name: record.name,
        dateOfBirth: record.dateOfBirth,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        age,
      };
    });

    res.json(processedRecords);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const totalRecords = await Record.countDocuments();
    if (totalRecords === 0) {
      return res.json({
        total: 0,
        averageAge: 0,
        youngest: null,
        oldest: null,
      });
    }

    // Youngest is the one with the maximum DOB (closest to today)
    const youngestRecord = await Record.findOne().sort({ dateOfBirth: -1 });
    // Oldest is the one with the minimum DOB (furthest from today)
    const oldestRecord = await Record.findOne().sort({ dateOfBirth: 1 });

    // Aggregate to get average date of birth in milliseconds
    const avgResult = await Record.aggregate([
      {
        $group: {
          _id: null,
          avgBirthMs: { $avg: { $toLong: '$dateOfBirth' } },
        },
      },
    ]);

    const avgBirthMs = avgResult[0]?.avgBirthMs || 0;
    const avgDob = new Date(avgBirthMs);
    const today = new Date();
    const avgAgeMs = today - avgDob;
    const avgAgeInYears = (avgAgeMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);

    res.json({
      total: totalRecords,
      averageAge: parseFloat(avgAgeInYears) || 0,
      youngest: youngestRecord
        ? {
            id: youngestRecord._id,
            name: youngestRecord.name,
            dateOfBirth: youngestRecord.dateOfBirth,
            age: calculateAge(youngestRecord.dateOfBirth),
          }
        : null,
      oldest: oldestRecord
        ? {
            id: oldestRecord._id,
            name: oldestRecord.name,
            dateOfBirth: oldestRecord.dateOfBirth,
            age: calculateAge(oldestRecord.dateOfBirth),
          }
        : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getRecordById = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    res.json({
      _id: record._id,
      name: record.name,
      dateOfBirth: record.dateOfBirth,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      age: calculateAge(record.dateOfBirth),
    });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const { name, dateOfBirth } = req.body;

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

    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    record.name = name.trim();
    record.dateOfBirth = dobDate;
    await record.save();

    res.json({
      message: 'Record updated successfully.',
      record: {
        _id: record._id,
        name: record.name,
        dateOfBirth: record.dateOfBirth,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        age: calculateAge(record.dateOfBirth),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Record not found.' });
    }

    await record.deleteOne();
    res.json({ message: 'Record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
