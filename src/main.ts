import express from 'express';
import type { Request, Response, NextFunction, Application } from 'express';
import { authController, userController } from './modules';
import { globalErrorHandling } from './middleware';
import { bootStrap } from './database/connection.database';
import { PORT } from './config/config';
const app: Application = express()

bootStrap(app,PORT)
app.use(express.json())

app.use("/auth", authController)
app.use("/user", userController)

app.use(globalErrorHandling)
app.all("/*anyThing", (req: Request, res: Response, next: NextFunction): Response => {
    return res.status(404).json({ message: "Invalid app routing." })
})
