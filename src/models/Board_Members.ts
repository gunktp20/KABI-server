import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection";
import User from "./User";
import Board from "./Board";

interface BoardMemberAttributes {
  id?: string;
  board_id: string;
  user_id?: string;
  "user.email"?: string;
  "user.displayName"?: string;
}

class BoardMembers
  extends Model<BoardMemberAttributes>
  implements BoardMemberAttributes
{
  public id!: string;
  public board_id!: string;
  public user_id!: string;
  public "user.email": string;
  public "user.displayName": string;
}

BoardMembers.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    board_id: {
      type: DataTypes.UUID,
      references: {
        model: Board,
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "board_members",
    timestamps: false,
  }
);

// Define the many-to-many relationships

// Sync and create the BoardMembers table
BoardMembers.sync({ force: false })
  .then(() => {
    console.log("BoardMembers table was created!");
  })
  .catch((err) => {
    console.error("Error creating BoardMembers table:", err);
  });

export default BoardMembers;
