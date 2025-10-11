export interface BlogPost {
  id: number;
  title: string;
  content: string;
  date: string;
  slug: string;
}

export interface Accomplishment {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link?: string;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface GameState {
  isPlaying: boolean;
  score: number;
  gameOver: boolean;
}