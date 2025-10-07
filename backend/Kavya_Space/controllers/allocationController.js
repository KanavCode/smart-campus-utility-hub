import User from "../models/userModel.js";
import Elective from "../models/electiveModel.js";

export const allocateElectives = async (req, res) => {
  try {
    // Fetch all students sorted by CGPA (highest first)
    const students = await User.findAll({
      where: { role: "student" },
      order: [["cgpa", "DESC"]],
    });

    // Get all electives and map them
    const electives = await Elective.findAll();
    const electiveMap = {};
    electives.forEach((e) => {
      electiveMap[e.subjectName] = { id: e.id, seats: e.maxSeats };
    });

    const allocationResults = [];

    for (const student of students) {
      const preferences = student.preferences || [];
      let allocated = false;

      // Loop through student preferences
      for (const subject of preferences) {
        const elective = electiveMap[subject];

        // If subject exists and has available seats
        if (elective && elective.seats > 0) {
          // Allocate this elective to the student
          await student.update({ allocatedElectiveId: elective.id });
          elective.seats -= 1;
          allocationResults.push({
            student: student.name,
            cgpa: student.cgpa,
            allocatedSubject: subject,
          });
          allocated = true;
          break;
        }
      }

      if (!allocated) {
        allocationResults.push({
          student: student.name,
          cgpa: student.cgpa,
          allocatedSubject: "None (No seat available)",
        });
      }
    }

    // Update electives in DB with new seat counts
    for (const subject in electiveMap) {
      const { id, seats } = electiveMap[subject];
      await Elective.update({ maxSeats: seats }, { where: { id } });
    }

    res.status(200).json({
      message: "Elective allocation completed successfully",
      allocationResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error allocating electives", error: error.message });
  }
};
