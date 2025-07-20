'use server';

/**
 * @fileOverview Generates fictional news articles based on a specific topic.
 *
 * - generateTopicNews - A function that generates news articles for a given topic.
 * - GenerateTopicNewsInput - The input type for the generateTopicNews function.
 * - GenerateTopicNewsOutput - The return type for the generateTopicNews function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratedArticleSchema = z.object({
  title: z.string().describe('A compelling, news-style headline for the article. Should be concise and engaging.'),
  content: z.string().describe('A short summary of the news article, typically 2-3 sentences long, similar to the style of Inshorts.'),
  author_name: z.string().describe("The name of the author or news agency, e.g., 'Tech Correspondent' or 'Market Analyst'."),
});

const GenerateTopicNewsInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic for which to generate news articles.'),
  numberOfArticles: z
    .number()
    .default(5)
    .describe('The number of news articles to generate.'),
});
export type GenerateTopicNewsInput = z.infer<typeof GenerateTopicNewsInputSchema>;

const GenerateTopicNewsOutputSchema = z.object({
  generatedNews: z.array(GeneratedArticleSchema).describe('An array of generated news articles for the topic.'),
});
export type GenerateTopicNewsOutput = z.infer<typeof GenerateTopicNewsOutputSchema>;


export async function generateTopicNews(
  input: GenerateTopicNewsInput
): Promise<GenerateTopicNewsOutput> {
  return generateTopicNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTopicNewsPrompt',
  input: { schema: GenerateTopicNewsInputSchema },
  output: { schema: GenerateTopicNewsOutputSchema },
  prompt: `You are an expert news writer for a service like Inshorts. Your task is to generate {{numberOfArticles}} fictional, short, and engaging news summaries based on the provided topic.

The generated articles should be plausible but clearly fictional. Do not use real, current events.
Each article must include a title, a short content summary (like a news blurb), and a plausible author name (like 'Sports Analyst' or 'Science Reporter').

Topic: {{{topic}}}

Generate {{numberOfArticles}} articles related to this topic.

Output the articles in the requested JSON format.
`,
});

const generateTopicNewsFlow = ai.defineFlow(
  {
    name: 'generateTopicNewsFlow',
    inputSchema: GenerateTopicNewsInputSchema,
    outputSchema: GenerateTopicNewsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
