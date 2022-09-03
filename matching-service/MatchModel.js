import { Model, DataTypes } from "sequelize";

import sequelize from "./database.js";

class MatchModel extends Model {}

MatchModel.init(
  {
    userId: DataTypes.UUID,
    difficulty: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "matchModel",
  }
);

export default MatchModel;
