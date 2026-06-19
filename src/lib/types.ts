export interface Game {
    id: string;
    title: string;
    description: string;
    prompt: string;
    authorId: string;
    authorName: string;
    status: "draft" | "published";
    category: string;
    emoji: string;
    likes: number;
    plays: number;
    createdAt: number;
    publishedAt: number | null;
    forkedFrom?: string;
    forkedFromTitle?: string;
}

export interface Like {
    id: string;
    gameId: string;
    userId: string;
    createdAt: number;
}

export interface Comment {
    id: string;
    gameId: string;
    authorId: string;
    authorName: string;
    authorPhoto: string;
    text: string;
    createdAt: number;
}
