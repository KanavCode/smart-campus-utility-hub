import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "student",
  },
  preferences: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  allocatedElectiveId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export default User;
