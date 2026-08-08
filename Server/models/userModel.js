import Joi from "joi";

export const userSchema = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    imageUrl: Joi.string().uri().required()
});