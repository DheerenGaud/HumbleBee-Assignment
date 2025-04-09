import { Router } from "express";
import { addCrop, getNearbyCrops } from "../controllers/crop.controller.js";

const router = Router()

router.route("").post(addCrop);
router.route("/nearby").get(getNearbyCrops); 

export default router