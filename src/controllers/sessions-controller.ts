import { AppError } from '@/utils/AppError';
import { prisma } from './../database/prisma';
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { compare } from 'bcrypt';
import { authConfig } from '@/configs/auth';
import { sign } from 'jsonwebtoken';


export class SessionsController {
 async create(request: Request, response: Response, next: NextFunction) {

    const bodySchema = z.object({
      email:z.string().email(),
      password:z.string().min(6).max(20),
    })
    const { email, password } = bodySchema.parse(request.body);
    const user =  await prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if(!user){
      throw new AppError("Invalid e-mail or password", 401);
    }

    const passwordMatch = await compare(password, user.password);

    if(!passwordMatch){
      throw new AppError("Invalid e-mail or password", 401);
    }

    const {secret, expiresIn} = authConfig.jwt

    const token = sign({role: user.role ?? "customer"}, secret, {
      subject: user.id,
      expiresIn: expiresIn,
    });

    const {password: hashedPassword, ...userWithoutPassword}  = user

     return response.status(200).json({ token, user: userWithoutPassword });
  }

 
}
