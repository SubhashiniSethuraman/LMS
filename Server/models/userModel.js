// import Joi from 'joi'

// export const userSchema = Joi.object ({
//     _id: Joi.string().required(), 
//     name: Joi.string().trim().required(), 
//     email: Joi.string().email().required(), 
//     imageUrl: Joi.string().uri().required(),
//     enrolledCourses: Joi.array().items(
//         Joi.string().hex().length(24)
//     ).default([])
// })

import Joi from "joi";

export const userSchema = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    imageUrl: Joi.string().uri().required(),

    enrolledCourses: Joi.array()
        .items(Joi.string().hex().length(24))
        .default([]),

    createdAt: Joi.date().default(() => new Date()),

    updatedAt: Joi.date().default(() => new Date())
});