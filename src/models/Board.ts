import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection";
import User from "./User";
import Column from "./Column";
import Task from "./Task";
import BoardMembers from "./Board_Members";
import Invitation from "./Invitation";
import Assignment from "./Assignment";

interface BoardAttributes {
  id: string;
  board_name: string;
  key: string;
  description: string;
  owner_id: string;
}

interface BoardCreationAttributes extends Optional<BoardAttributes, "id"> {}

class Board
  extends Model<BoardAttributes, BoardCreationAttributes>
  implements BoardAttributes
{
  public id!: string;
  public board_name!: string;
  public key!: string;
  public description!: string;
  public owner_id!: string;
}

Board.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    board_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    owner_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "boards",
    timestamps: false,
  }
);

Board.hasMany(BoardMembers, { foreignKey: "board_id" });
Board.hasMany(Column, { foreignKey: "board_id", sourceKey: "id" });
Board.hasMany(Task, {
  foreignKey: "board_id",
  sourceKey: "id",
  onDelete: "CASCADE",
});
Board.hasOne(Invitation, { foreignKey: "board_id", sourceKey: "id" });
Invitation.belongsTo(Board, { foreignKey: "board_id" });
BoardMembers.belongsTo(Board, { foreignKey: "board_id" });
Task.belongsTo(Board, { foreignKey: "board_id", onDelete: "CASCADE" });
Board.hasOne(Assignment, { foreignKey: "board_id", sourceKey: "id" });
BoardMembers.belongsTo(Board, { foreignKey: "board_id" });

Board.sync({ force: false })
  .then(async () => {
    console.log("Board table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Board;
