export type Sentiment = {
  label: "positive" | "neutral" | "negative" | "unknown";
  score: number | null;
};

export type Message = {
  id: string;
  userId: string;
  userNickname?: string;
  text: string;
  sentiment: Sentiment;
  createdAt: string;
};

export type RawMessage = {
  id: string;
  userId: string;
  userNickname?: string;
  text: string;
  sentimentLabel?: string | null;
  sentimentScore?: number | null;
  createdAt: string;
};
