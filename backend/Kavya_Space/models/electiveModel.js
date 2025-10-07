import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Elective = sequelize.define("Elective", {
  subjectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  maxSeats: {
    type: DataTypes.INTEGER,
    defaultValue: 50,
  },
});

export default Elective;
