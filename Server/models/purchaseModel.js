import Joi from "joi";

export const purchaseSchema = Joi.object({
    courseId: Joi.string().required(),
    userId: Joi.string().required(),
    amount: Joi.number().required(),
    status: Joi.string().valid('pending','completed','failed').default('pending')
})