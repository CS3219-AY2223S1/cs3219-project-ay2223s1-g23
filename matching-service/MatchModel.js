import { Model, DataTypes } from "sequelize";

import sequelize from "./database.js";

class MatchModel extends Model { }

MatchModel.init(
  {
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    difficulty: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "matchModel",
  }
);

export default MatchModel;
