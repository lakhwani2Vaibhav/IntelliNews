'use server';

/**
 * @fileOverview Generates fictional news articles based on user's reading history.
 *
 * - generateSuggestedNews - A function that generates suggested news articles.
 * - GenerateSuggestedNewsInput - The input type for the generateSuggestedNews function.
 * - GenerateSuggestedNewsOutput - The return type for the generateSuggestedNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratedArticleSchema = z.object({
  title: z.string().describe('A compelling, news-style headline for the article. Should be concise and engaging.'),
  content: z.string().describe('A short summary of the news article, typically 2-3 sentences long, similar to the style of Inshorts.'),
  author_name: z.string().describe("The name of the author or news agency, e.g., 'Tech Correspondent' or 'Market Analyst'."),
  category: z.string().describe("The category of the news, e.g., 'Technology', 'Sports', 'Business'."),
});

const GenerateSuggestedNewsInputSchema = z.object({
  readingHistory: z
    .string()
    .describe("The user's reading history, as a string of comma-separated topics."),
  numberOfArticles: z
    .number()
    .default(3)
    .describe('The number of news articles to generate.'),
  language: z.string().default('English').describe('The language for the generated news articles (e.g., "English", "Hindi").'),
});
export type GenerateSuggestedNewsInput = z.infer<typeof GenerateSuggestedNewsInputSchema>;

const GenerateSuggestedNewsOutputSchema = z.object({
  suggestedNews: z.array(GeneratedArticleSchema).describe('An array of generated news articles.'),
});
export type GenerateSuggestedNewsOutput = z.infer<typeof GenerateSuggestedNewsOutputSchema>;


export async function generateSuggestedNews(
  input: GenerateSuggestedNewsInput
): Promise<GenerateSuggestedNewsOutput> {
  return generateSuggestedNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSuggestedNewsPrompt',
  input: { schema: GenerateSuggestedNewsInputSchema },
  output: { schema: GenerateSuggestedNewsOutputSchema },
  prompt: `You are an expert news writer for a service like Inshorts. Your task is to generate {{numberOfArticles}} fictional, short, and engaging news summaries based on the user's reading history, in the specified language.

The generated articles should be plausible but clearly fictional. Do not use real, current events.
Each article must include a title, a short content summary (like a news blurb), a plausible author name (like 'Sports Analyst'), and a category.

Language: {{{language}}}
User's Reading History: {{{readingHistory}}}

Generate the articles based on these topics. For example, if the history includes 'technology', write a short piece about a fictional new gadget. If it includes 'finance', write about a fictional market trend.

Output the articles in the requested JSON format. The text content (title, content, author_name, category) should be in {{{language}}}.
`,
});

const generateSuggestedNewsFlow = ai.defineFlow(
  {
    name: 'generateSuggestedNewsFlow',
    inputSchema: GenerateSuggestedNewsInputSchema,
    outputSchema: GenerateSuggestedNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
