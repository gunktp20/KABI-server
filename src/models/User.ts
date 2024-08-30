import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection";
import Board from "./Board";
import Task from "./Task";
import Invitation from "./Invitation";
import BoardMembers from "./Board_Members";
import Assignment from "./Assignment";

interface UserAttributes {
  id: string;
  email: string;
  password?: string;
  displayName: string;
  verified?: boolean;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: string;
  public email!: string;
  public password!: string;
  public displayName!: string;
  public verified!: boolean;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "users",
    timestamps: false,
  }
);

User.hasMany(Board, {
  foreignKey: "owner_id",
  sourceKey: "id",
});
User.hasMany(BoardMembers, { foreignKey: "user_id" });
Board.belongsTo(User, { foreignKey: "owner_id" });
User.hasMany(Task, {
  foreignKey: "assignee_id",
  sourceKey: "id",
});
Task.belongsTo(User, { foreignKey: "assignee_id" });
User.hasOne(Invitation, {
  foreignKey: "recipient_id",
  sourceKey: "id",
});
User.hasOne(Invitation, {
  foreignKey: "sender_id",
  sourceKey: "id",
});
BoardMembers.belongsTo(User, { foreignKey: "user_id" });
Invitation.belongsTo(User, { as: "recipient", foreignKey: "recipient_id" });
Invitation.belongsTo(User, { as: "sender", foreignKey: "sender_id" });

User.hasMany(Assignment, {
  foreignKey: "assignee_id",
  sourceKey: "id",
  as: "assignee"
});
User.hasMany(Assignment, {
  foreignKey: "sender_id",
  sourceKey: "id",
  as: "sender"
});
Assignment.belongsTo(User, { as: "assignee", foreignKey: "assignee_id" });
Assignment.belongsTo(User, { as: "sender", foreignKey: "sender_id" });

User.sync({ force: false })
  .then(async () => {
    console.log("User table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default User;
