import { Router } from "express";
import { UsersControllers } from "@/controllers/users-controllers";

export const usersRoutes = Router();
const usersControllers = new UsersControllers();

usersRoutes.post("/", usersControllers.create);