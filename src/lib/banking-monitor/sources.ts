export interface MonitorSource {
  id: string;
  name: string;
  rssUrl: string;
  baseUrl: string;
  category: 'federal' | 'state';
}

// Primary regulatory sources for 1st Source Corporation (South Bend, IN)
// Covers federal banking regulators + Indiana state regulator
export const BANKING_MONITOR_SOURCES: MonitorSource[] = [
  {
    id: 'treasury',
    name: 'U.S. Department of the Treasury',
    rssUrl: 'https://home.treasury.gov/system/files/rss/treasury-rss.xml',
    baseUrl: 'https://home.treasury.gov',
    category: 'federal',
  },
  {
    id: 'occ',
    name: 'OCC - Office of the Comptroller of the Currency',
    rssUrl: 'https://www.occ.gov/news-issuances/news-releases/news-releases.rss',
    baseUrl: 'https://www.occ.gov',
    category: 'federal',
  },
  {
    id: 'fdic',
    name: 'FDIC - Federal Deposit Insurance Corporation',
    rssUrl: 'https://www.fdic.gov/news/press-releases/rss.xml',
    baseUrl: 'https://www.fdic.gov',
    category: 'federal',
  },
  {
    id: 'fed',
    name: 'Federal Reserve',
    rssUrl: 'https://www.federalreserve.gov/feeds/press_all.xml',
    baseUrl: 'https://www.federalreserve.gov',
    category: 'federal',
  },
  {
    id: 'cfpb',
    name: 'CFPB - Consumer Financial Protection Bureau',
    rssUrl: 'https://www.consumerfinance.gov/about-us/newsroom/feed/',
    baseUrl: 'https://www.consumerfinance.gov',
    category: 'federal',
  },
  {
    id: 'indiana-dfi',
    name: 'Indiana Department of Financial Institutions',
    rssUrl: 'https://www.in.gov/dfi/rss.xml',
    baseUrl: 'https://www.in.gov/dfi',
    category: 'state',
  },
];
