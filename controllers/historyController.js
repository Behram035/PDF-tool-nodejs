import History from "../models/History.js";

/*
GET ALL HISTORY
*/

export const getHistory = async (req, res) => {
  try {
    const history = await History.find().sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/*
DELETE HISTORY ENTRY
*/

export const deleteHistory = async (req, res) => {
  try {
    await History.findByIdAndDelete(req.params.id);

    res.json({
      message: "History deleted",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
