import {Request, Response, NextFunction } from "express";


export class DeliveriesController {
     create(request: Request, response: Response, next: NextFunction) {
          return response.json({
               message: "Create a delivery"})
}

}