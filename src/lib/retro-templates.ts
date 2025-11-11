export interface RetroColumn {
  id: string;
  title: string;
  description?: string;
  color: string;
  emoji: string;
}

export interface RetroTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  columns: RetroColumn[];
  votingEnabled: boolean;
  maxVotesPerPerson?: number;
  hasAppreciations?: boolean;
  hasRecommendations?: boolean;
}

export const RETRO_TEMPLATES: RetroTemplate[] = [
  {
    id: 'start-stop-continue',
    name: 'Start, Stop, Continue',
    description: 'Identify what to start doing, stop doing, and continue doing',
    icon: '🔄',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'start',
        title: 'Start',
        description: 'What should we start doing?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '🚀',
      },
      {
        id: 'stop',
        title: 'Stop',
        description: 'What should we stop doing?',
        color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
        emoji: '🛑',
      },
      {
        id: 'continue',
        title: 'Continue',
        description: 'What should we keep doing?',
        color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
        emoji: '✅',
      },
    ],
  },
  {
    id: 'mad-sad-glad',
    name: 'Mad, Sad, Glad',
    description: 'Express emotions about the sprint - what made you mad, sad, or glad',
    icon: '😊',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'mad',
        title: 'Mad',
        description: 'What made you frustrated or angry?',
        color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
        emoji: '😠',
      },
      {
        id: 'sad',
        title: 'Sad',
        description: 'What disappointed you?',
        color: 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
        emoji: '😢',
      },
      {
        id: 'glad',
        title: 'Glad',
        description: 'What made you happy?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '😄',
      },
    ],
  },
  {
    id: 'four-ls',
    name: '4 Ls',
    description: 'Liked, Learned, Lacked, Longed For',
    icon: '💡',
    votingEnabled: true,
    maxVotesPerPerson: 6,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'liked',
        title: 'Liked',
        description: 'What did you enjoy?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '❤️',
      },
      {
        id: 'learned',
        title: 'Learned',
        description: 'What did you learn?',
        color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
        emoji: '📚',
      },
      {
        id: 'lacked',
        title: 'Lacked',
        description: 'What was missing?',
        color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
        emoji: '⚠️',
      },
      {
        id: 'longed-for',
        title: 'Longed For',
        description: 'What did you wish for?',
        color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
        emoji: '✨',
      },
    ],
  },
  {
    id: 'sailboat',
    name: 'Sailboat',
    description: 'Island (goal), Wind (what helps), Anchor (what slows), Rocks (risks)',
    icon: '⛵',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'island',
        title: 'Island (Goal)',
        description: 'Where are we headed?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '🏝️',
      },
      {
        id: 'wind',
        title: 'Wind (Helps)',
        description: 'What propels us forward?',
        color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
        emoji: '💨',
      },
      {
        id: 'anchor',
        title: 'Anchor (Slows)',
        description: 'What holds us back?',
        color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
        emoji: '⚓',
      },
      {
        id: 'rocks',
        title: 'Rocks (Risks)',
        description: 'What dangers do we face?',
        color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
        emoji: '🪨',
      },
    ],
  },
  {
    id: 'went-well-improve',
    name: 'Went Well / To Improve',
    description: 'Simple two-column retro focusing on positives and improvements',
    icon: '🎯',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'went-well',
        title: 'Went Well',
        description: 'What went well this sprint?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '✅',
      },
      {
        id: 'to-improve',
        title: 'To Improve',
        description: 'What could be better?',
        color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
        emoji: '🔧',
      },
    ],
  },
  {
    id: 'rose-bud-thorn',
    name: 'Rose, Bud, Thorn',
    description: 'Roses (highlights), Buds (opportunities), Thorns (challenges)',
    icon: '🌹',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'rose',
        title: 'Rose',
        description: 'Highlights and wins',
        color: 'bg-pink-100 dark:bg-pink-900/20 border-pink-300 dark:border-pink-700',
        emoji: '🌹',
      },
      {
        id: 'bud',
        title: 'Bud',
        description: 'Opportunities and potential',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '🌱',
      },
      {
        id: 'thorn',
        title: 'Thorn',
        description: 'Challenges and pain points',
        color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
        emoji: '🌵',
      },
    ],
  },
  {
    id: 'keep-drop-add',
    name: 'Keep, Drop, Add',
    description: 'What to keep doing, drop, and add to our process',
    icon: '📋',
    votingEnabled: true,
    maxVotesPerPerson: 5,
    hasAppreciations: true,
    hasRecommendations: true,
    columns: [
      {
        id: 'keep',
        title: 'Keep',
        description: 'What should we keep doing?',
        color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
        emoji: '✅',
      },
      {
        id: 'drop',
        title: 'Drop',
        description: 'What should we stop doing?',
        color: 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700',
        emoji: '❌',
      },
      {
        id: 'add',
        title: 'Add',
        description: 'What should we start doing?',
        color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
        emoji: '➕',
      },
    ],
  },
];

export function getTemplateById(templateId: string): RetroTemplate | undefined {
  return RETRO_TEMPLATES.find((t) => t.id === templateId);
}

export function getColumnsByTemplate(templateId: string): RetroColumn[] {
  const template = getTemplateById(templateId);
  return template?.columns || [];
}
