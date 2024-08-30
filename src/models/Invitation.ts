import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection";
import User from "./User";
import Board from "./Board";

interface InvitationAttributes {
  id: string;
  recipient_id: string;
  sender_id: string;
  status?: string;
  board_id: string;
  seen?: boolean;
}

interface InvitationCreationAttributes
  extends Optional<InvitationAttributes, "id"> {}

class Invitation
  extends Model<InvitationAttributes, InvitationCreationAttributes>
  implements InvitationAttributes
{
  public id!: string;
  public recipient_id!: string;
  public sender_id!: string;
  public status!: string;
  public board_id!: string;
  public seen!: boolean;
}

Invitation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    recipient_id: {
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
    status: {
      type: DataTypes.ENUM({
        values: ["pending", "accepted", "declined"],
      }),
      defaultValue: "pending",
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
    modelName: "invitations",
    timestamps: true,
  }
);

Invitation.sync({ force: false })
  .then(async () => {
    console.log("Invitation table was created !");
  })
  .catch((err) => {
    console.log(err);
  });

export default Invitation;
