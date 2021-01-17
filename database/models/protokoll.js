//npm
import mongoose from "mongoose";
 
const protokollSchema = new mongoose.Schema(
  {
    rounds: Array,
    cellsId: mongoose.ObjectId,
    tactic: String
  },
  {
    timestamps: true 
  }
);
 
const Protokoll = mongoose.model("Protokoll", protokollSchema);
 
export default Protokoll;