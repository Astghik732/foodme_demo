import { z } from "zod";

export const MAX_RATING_COMMENT_LENGTH = 1000;

export const ratingSchema = z.object({
  stars: z
    .number({ error: "Choose a star rating" })
    .int("Choose a star rating")
    .min(1, "Choose a star rating")
    .max(5, "Choose a star rating"),
  comment: z
    .string()
    .max(MAX_RATING_COMMENT_LENGTH, `Comment must be at most ${MAX_RATING_COMMENT_LENGTH} characters`),
});

export type RatingFormValues = z.infer<typeof ratingSchema>;
