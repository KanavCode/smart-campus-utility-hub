import Elective from "../models/electiveModel.js";

export const createElective = async (req, res) => {
  try {
    const { subjectName, maxSeats } = req.body;
    const elective = await Elective.create({ subjectName, maxSeats });
    res.status(201).json(elective);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllElectives = async (req, res) => {
  try {
    const electives = await Elective.findAll();
    res.status(200).json(electives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
