const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subjects: [
    {
      type: String,
      required: true,
    },
  ],
});

const departmentSchema = new mongoose.Schema({
  _id: mongoose.Types.ObjectId,
  department: {
    type: String,
    required: true,
  },
  majors: [majorSchema],
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
