/* eslint-disable no-console */

const Tour = require('../models/tourModel');

// Route handlers - Tours

exports.getAllTours = async (req, res) => {
  try {
    // BUILD QUERY
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //console.log(req.query);

    //const tours = await Tour.find(req.query); // This is also working for some reason

    // ADVANCE FILTER OBJECT usign Regex
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));

    // { difficulty: 'easy', duration: { $gte: 5 } }
    // { difficulty: 'easy', duration: { gte: 5 } }
    // gte, gt, lte, lt

    let query = Tour.find(JSON.parse(queryStr)); // We will only use await after building and attaching every part of query like sorting filttering and pagination

    // SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      console.log(sortBy);
      query = query.sort(sortBy);
      // sorting if 2 things are same
    } else {
      // Default sorting
      query = query.sort('-createdAt');
    }

    //FIELD LIMITING
    if (req.query.fields) {
      // Include only certain fields query - localhost:3000/api/v1/tours?fields=name,duration,price
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      // Else remove __v and send everything else
      query = query.select('-__v');
    }

    // EXECUTE QUERY
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'Fail',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: 'Invalid data sent!',
    });
  }
};
