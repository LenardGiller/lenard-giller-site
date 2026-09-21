import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// The CMS (Sveltia) always writes every configured field, even ones the
// editor left empty - and for a "number" widget specifically, its empty
// state is `null`, not an omitted key (string/boolean widgets default to
// "" / false instead, which the plain types below already accept fine).
// `z.number().optional()` alone rejects that `null` outright: it's valid
// YAML, but `typeof null === "object"` in JS, so the schema sees "object"
// where it wanted "number" and fails the whole build. Accept null and
// normalize it to undefined, matching what every consumer already expects.
const optionalNumber = z
	.number()
	.nullable()
	.optional()
	.transform((value) => value ?? undefined);

const venue = z.object({
	exhibitionTitle: z.string().optional(),
	venue: z.string(),
	dates: z.string().optional(),
	curator: z.string().optional(),
	photography: z.string().optional(),
	participatingArtists: z.string().optional(),
});

const works = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/works" }),
	schema: z.object({
		title: z.string(),
		order: z.number(),
		year: z.string(),
		images: z.array(z.string()),
		medium: z.string().optional(),
		catalogue: z.string().optional(),
		photography: z.string().optional(),
		venues: z.array(venue).optional(),
		imagesBeforeInfo: optionalNumber,
		imagesBeforeDescription: optionalNumber,
		venuesAfterImages: optionalNumber,
		trailingImages: optionalNumber,
		imagesAfterPhotography: optionalNumber,
		venueBeforeImages: z.boolean().optional(),
		descriptionBeforeVenue: z.boolean().optional(),
		descriptionBeforeImages: z.boolean().optional(),
		hideTopYear: z.boolean().optional(),
		press: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
	}),
});

const publications = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/publications" }),
	schema: z.object({
		year: z.number(),
		order: z.number(),
	}),
});

export const collections = { works, publications };
