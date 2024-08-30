import { Sequelize } from "sequelize";
import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASS,
  DATABASE_USER,
} from "../config/application.config";
import dotenv from "dotenv";
dotenv.config();

const DATABASE_PORT: number = parseInt(process.env.DATABASE_PORT as string, 10);

const sequelize = new Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASS, {
  host: DATABASE_HOST,
   dialect: 'postgres',
  port: DATABASE_PORT,
  logging: false,
  dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
 },
});

export default sequelize;
