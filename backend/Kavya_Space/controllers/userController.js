import User from "../models/userModel.js";
import Elective from "../models/electiveModel.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, cgpa, preferences } = req.body;
    const user = await User.create({ name, email, password, cgpa, preferences });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

