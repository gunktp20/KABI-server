import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection";
import User from "./User";
import Column from "./Column";
import Board from "./Board";
import Assignment from "./Assignment";

interface TaskAttributes {
  id: string;
  description: string;
  sequence?: number;
  position?: number;
  board_id: string;
  column_id: string;
  assignee_id: string;
  "board.board_name"?: string;
}

interface TaskCreationAttributes extends Optional<TaskAttributes, "id"> {}

class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes
{
  public id!: string;
  public description!: string;
  public sequence!: number;
  public position!: number;
  public board_id!: string;
  public column_id!: string;
  public assignee_id!: string;
  public "board.board_name"!: string;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sequence: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    board_id: {
      type: DataTypes.UUID,
      references: {
        model: Board,
        key: "id",
      },
    },
    column_id: {
      type: DataTypes.UUID,
      references: {
        model: Column,
        key: "id",
      },
    },
    assignee_id: {
      type: DataTypes.UUID,
      references: {
        model: User,
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "tasks",
    timestamps: false,
    hooks: {
      async beforeCreate(task, options) {
        const maxSequence: number = await Task.max("sequence", {
          where: { board_id: task.board_id },
        });
        task.sequence = maxSequence ? maxSequence + 1 : 1;
        task.position = maxSequence ? maxSequence + 1 : 1;
      },
    },
  }
);

Task.hasOne(Assignment, {
  foreignKey: "task_id",
  sourceKey: "id",
  onDelete: "CASCADE",
});
Assignment.belongsTo(Task, { foreignKey: "task_id", onDelete: "CASCADE" });

Task.sync({ force: false })
  .then(async () => {
    console.log("Task table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Task;
