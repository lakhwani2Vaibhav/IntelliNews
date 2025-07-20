# **App Name**: Inshorts News Explorer

## Core Features:

- Trending Topics Display: Display trending news topics fetched from the /news/trending-list endpoint.
- General News Feed: Fetch and display general news from the /news/get-news endpoint.
- Topic-Specific News: Fetch and display topic-specific news using the /news/topic-news/<topic> endpoint. The <topic> is dynamically populated from trending topics.
- Pagination Support: Implement infinite scrolling or pagination for loading more news articles within each topic.  Utilize the `page` parameter of the /news/topic-news/<topic> endpoint.
- Topic Suggestion Engine: Utilize a tool to suggest relevant topics to users based on their viewing history.
- Language Selection: Allow users to select their preferred language (English or Hindi) which will persist throughout the app session.

## Style Guidelines:

- Primary color: Deep blue (#2E3192) to convey trust and information.
- Background color: Very light gray (#F0F2F5), almost white, for a clean reading experience.
- Accent color: A vibrant orange (#FF6B6B) to highlight interactive elements.
- Body and headline font: 'Inter', a grotesque sans-serif font, will be used throughout, giving a modern machined look.