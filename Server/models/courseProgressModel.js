import Joi from "joi";

export const courseProgressSchema = Joi.object({
    userId: Joi.string().required(),
    courseId: Joi.string().required(),
    completed: Joi.boolean().default(false),
    lectureCompleted: Joi.array().items(
            Joi.string()
        ).default([])
})