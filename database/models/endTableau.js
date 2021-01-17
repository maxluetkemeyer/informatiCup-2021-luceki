//npm
import mongoose from "mongoose";

const endTableauSchema = new mongoose.Schema(
  {
    cells: Array
  }
);
 
const EndTableau = mongoose.model("EndTableau", endTableauSchema);
 
export default EndTableau;