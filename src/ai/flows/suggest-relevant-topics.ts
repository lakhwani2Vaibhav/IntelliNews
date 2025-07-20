'use server';

/**
 * @fileOverview Suggests relevant news topics based on the user's reading history.
 *
 * - suggestRelevantTopics - A function that suggests relevant news topics.
 * - SuggestRelevantTopicsInput - The input type for the suggestRelevantTopics function.
 * - SuggestRelevantTopicsOutput - The return type for the suggestRelevantTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantTopicsInputSchema = z.object({
  readingHistory: z
    .string()
    .describe("The user's reading history, as a string of comma separated topics."),
  numberOfSuggestions: z
    .number()
    .default(3)
    .describe('The maximum number of topic suggestions to return.'),
});
export type SuggestRelevantTopicsInput = z.infer<typeof SuggestRelevantTopicsInputSchema>;

const SuggestRelevantTopicsOutputSchema = z.object({
  suggestedTopics: z.array(z.string()).describe('An array of suggested news topics.'),
});
export type SuggestRelevantTopicsOutput = z.infer<typeof SuggestRelevantTopicsOutputSchema>;

export async function suggestRelevantTopics(
  input: SuggestRelevantTopicsInput
): Promise<SuggestRelevantTopicsOutput> {
  return suggestRelevantTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantTopicsPrompt',
  input: {schema: SuggestRelevantTopicsInputSchema},
  output: {schema: SuggestRelevantTopicsOutputSchema},
  prompt: `Based on the user's reading history, suggest {{numberOfSuggestions}} relevant news topics.

Reading History: {{{readingHistory}}}

Make sure the suggested topics are single words or short phrases.

Output the topics as a JSON array of strings.`,
});

const suggestRelevantTopicsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantTopicsFlow',
    inputSchema: SuggestRelevantTopicsInputSchema,
    outputSchema: SuggestRelevantTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
