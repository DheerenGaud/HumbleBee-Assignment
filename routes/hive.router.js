import { Router } from "express";
import {addHive,getHive } from "../controllers/hive.controller.js";

const router = Router()


router.route("").get(getHive)
router.route("").post(addHive)

export default router

