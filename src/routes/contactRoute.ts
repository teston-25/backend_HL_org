import express from "express";
import { createContact } from "../controllers/contact";
import { validate } from "../middleware/validate";
import { contactSchema } from "../../validations/contactValidation";

const router = express.Router();

router.post("/", validate(contactSchema), createContact);

export default router;