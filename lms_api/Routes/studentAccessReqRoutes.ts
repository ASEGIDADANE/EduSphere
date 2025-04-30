import express from "express";
import e, { Request, Response } from "express";
import {requestInstructorAccess} from  "../Controllers/studentAccessReqControllers";
import authenticateUser from "../Middlewares/authMiddlewares";


const router = express.Router();

router.post(
    "/request-instructor-access",authenticateUser, requestInstructorAccess
);
export default router;