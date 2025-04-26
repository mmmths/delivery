import { Request, Response, NextFunction } from "express";
import { prisma } from "@/database/prisma";
import { z } from "zod";
import { AppError } from "@/utils/AppError";

export class DeliveryLogsController {
  async create(request: Request, response: Response, next: NextFunction) {
    const bodySchema = z.object({
      delivery_id: z.string().uuid(),
      description: z.string(),
    });

    const { delivery_id, description } = bodySchema.parse(request.body);
    const delivery = await prisma.delivery.findUnique({
      where: {
        id: delivery_id,
      },
    });

    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }

    if(delivery.status == "delivered") {
     throw new AppError("Delivery already delivered", 400);
}

    if (delivery.status == "processing") {
      throw new AppError("Change status to shipped", 400);
    }

    await prisma.deliveryLog.create({
      data: {
        deliveryId: delivery_id,
        description,
      },
    });
    const log = await prisma.deliveryLog.create({
     data: {
       deliveryId: delivery_id,
       description,
     },
   });
   
   

    return response
      .status(201)
      .json({ message: "DeliveryLogsController.create" });
  }

  async show(request: Request, response: Response, next: NextFunction) {
    const paramsSchema = z.object({
      delivery_id: z.string().uuid(),
    });

    const { delivery_id } = paramsSchema.parse(request.params);

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: delivery_id,
      },
      include:{
          user: true,
          logs: true
      }
    });

    if (!delivery) {
      throw new AppError("Delivery not found", 404);
    }

    if (request.user?.role == "customer" && request.user.id != delivery.userId) {
      throw new AppError("The user can only view their deliveries", 401);
     }

    return response.status(200).json(delivery);
  }
}
