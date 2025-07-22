export interface StartupNewsData {
    id: string;
    title: string;
    source: {
        name: string;
        displayImage: string;
    };
    imageUrl: string;
    curatedText: string;
    sourceUrl: string;
    publishedAt: string;
    likesCount: number;
    viewCount: number;
}

export interface QuizOption {
    selectionCount: number;
    text: string;
}

export interface QuizLink {
    imageUrl: string;
    title: string;
    url: string;
}

export interface StartupQuizData {
    id: string;
    promptText: string;
    options: QuizOption[];
    pick: number; // 1-based index of correct option
    viewCount: number;
    likesCount: number;
    link?: QuizLink;
    type: 'QUIZ';
}


export type StartupItem = {
    id: string;
} & ({
    type: 'NEWS';
    data: StartupNewsData;
} | {
    type: 'QUIZ';
    data: StartupQuizData;
});


export interface StartupApiResponse {
    data: StartupItem[];
    nextSegment: string | null;
    status: string;
}
