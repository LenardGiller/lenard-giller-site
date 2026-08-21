import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const venue = z.object({
	exhibitionTitle: z.string().optional(),
	venue: z.string(),
	dates: z.string().optional(),
	curator: z.string().optional(),
	photography: z.string().optional(),
	participatingArtists: z.array(z.string()).optional(),
});

const works = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
	schema: z.object({
		title: z.string(),
		order: z.number(),
		year: z.string(),
		medium: z.string().optional(),
		catalogue: z.string().optional(),
		photography: z.string().optional(),
		venues: z.array(venue).optional(),
		imagesBeforeInfo: z.number().optional(),
		imagesBeforeDescription: z.number().optional(),
		venuesAfterImages: z.number().optional(),
		trailingImages: z.number().optional(),
		imagesAfterPhotography: z.number().optional(),
		venueBeforeImages: z.boolean().optional(),
		descriptionBeforeVenue: z.boolean().optional(),
		descriptionBeforeImages: z.boolean().optional(),
		hideTopYear: z.boolean().optional(),
		press: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
	}),
});

const bibliography = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/bibliography" }),
	schema: z.object({
		year: z.number(),
		order: z.number(),
	}),
});

export const collections = { works, bibliography };
