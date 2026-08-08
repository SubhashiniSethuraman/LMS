import Joi from "joi";

export const lectureSchema = Joi.object({
    lectureId: Joi.string().required(),
    lectureTitle: Joi.string().trim().required(),
    lectureDuration: Joi.number().required(),
    lectureUrl: Joi.string().required(),
    isPreviewFree: Joi.boolean().required(),
    lectureOrder: Joi.number().required(),
})

export const chapterSchema = Joi.object({
    chapterId: Joi.string().required(),
    chapterOrder: Joi.number().required(),
    chapterTitle: Joi.string().trim().required(),
    chapterContent: Joi.array().items(lectureSchema).default([])
})

export const courseSchema = Joi.object({
    courseTitle: Joi.string().trim().required(),
    courseDescription: Joi.string().trim().required(),
    courseThumbNail: Joi.string().uri().required(),
    coursePrice: Joi.number().min(0).required(),
    isPublished: Joi.boolean().default(true),
    discount: Joi.number().min(0).max(100).required(),
    courseContent: Joi.array().items(chapterSchema).default([]),
    courseRatings: Joi.array().items(
        Joi.object({
            userId: Joi.string().required(),
            rating: Joi.number().min(1).max(5).required()
        })
    ).default([]),
    educator: Joi.string().required(),
    enrolledStudents: Joi.array().items(
        Joi.string()
    ).default([])
})