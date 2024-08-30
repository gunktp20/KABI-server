import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection";
import User from "./User";
import Task from "./Task";
import Board from "./Board";

interface AssignmentAttributes {
  id: string;
  assignee_id: string;
  sender_id: string;
  task_id: string;
  board_id: string;
  seen?: boolean;
}

interface AssignmentCreationAttributes
  extends Optional<AssignmentAttributes, "id"> {}

class Assignment
  extends Model<AssignmentAttributes, AssignmentCreationAttributes>
  implements AssignmentAttributes
{
  public id!: string;
  public assignee_id!: string;
  public sender_id!: string;
  public task_id!: string;
  public board_id!: string;
  public seen!: boolean;
}

Assignment.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    assignee_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    sender_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
    task_id: {
      type: DataTypes.UUID,
      references: {
        model: Task,
        key: "id",
      },
    },
    board_id: {
      type: DataTypes.UUID,
      references: {
        model: Board,
        key: "id",
      },
    },
    seen: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "assignment",
    timestamps: true,
  }
);

Assignment.sync({ force: false })
  .then(async () => {
    console.log("Assignment table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Assignment;
