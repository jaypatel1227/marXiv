import { XMLParser } from 'fast-xml-parser';

const API_URL = 'http://export.arxiv.org/api/query';

export interface ArxivPaper {
  id: string; // The full ID, e.g. "http://arxiv.org/abs/2103.12345"
  shortId: string; // The short ID, e.g. "2103.12345"
  title: string;
  summary: string;
  authors: string[];
  published: string;
  updated: string;
  category: string;
  links: {
    rel: string;
    href: string;
    type?: string;
    title?: string;
  }[];
  pdfLink?: string;
}

export interface ArxivResponse {
  totalResults: number;
  startIndex: number;
  itemsPerPage: number;
  entries: ArxivPaper[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

function parseEntry(entry: any): ArxivPaper {
    // Authors
    let authorsRaw = entry.author;
    if (!authorsRaw) authorsRaw = [];
    if (!Array.isArray(authorsRaw)) {
        authorsRaw = [authorsRaw];
    }
    const authors = authorsRaw.map((a: any) => typeof a.name === 'string' ? a.name : a.name['#text'] || '');

    // Links
    let linksRaw = entry.link;
    if (!linksRaw) linksRaw = [];
    if (!Array.isArray(linksRaw)) {
        linksRaw = [linksRaw];
    }
    const links = linksRaw.map((link: any) => ({
      rel: link['@_rel'],
      href: link['@_href'],
      type: link['@_type'],
      title: link['@_title'],
    }));

    const pdfLink = links.find((l: any) => l.title === 'pdf' || l.type === 'application/pdf' || l.rel === 'related')?.href;

    const id = entry.id;
    // Extract short ID from the id url (http://arxiv.org/abs/xxxx.xxxxx) or (http://arxiv.org/abs/math/0510097)
    // We want the part after /abs/
    const shortIdParts = id.split('/abs/');
    const shortId = shortIdParts.length > 1 ? shortIdParts[1] : id;

    // Category
    let catRaw = entry.category;
    let category = "";
    if (Array.isArray(catRaw)) {
        category = catRaw[0]['@_term'];
    } else if (catRaw) {
        category = catRaw['@_term'];
    }

    // Title and Summary cleanup
    // Sometimes they contain newlines
    const title = typeof entry.title === 'string' ? entry.title : entry.title['#text'] || '';
    const summary = typeof entry.summary === 'string' ? entry.summary : entry.summary['#text'] || '';

    return {
      id,
      shortId,
      title: title.replace(/\s+/g, ' ').trim(),
      summary: summary.trim(),
      authors,
      published: entry.published,
      updated: entry.updated,
      category,
      links,
      pdfLink,
    };
}

function formatQuery(query: string): string {
  // regex to match phrases in quotes or single words
  const regex = /"[^"]+"|\S+/g;
  const tokens = query.match(regex) || [];

  const operators = ['AND', 'OR', 'ANDNOT'];
  const result: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const upperToken = token.toUpperCase();

    let effectiveToken = token;
    let isOperator = operators.includes(upperToken);

    if (upperToken === 'AND' || upperToken === 'OR' || upperToken === 'ANDNOT') {
      effectiveToken = upperToken; // Normalize to uppercase
      isOperator = true;
    }

    if (i > 0) {
      const prevToken = result[result.length - 1];
      const prevUpper = prevToken.toUpperCase();
      const prevIsOperator = operators.includes(prevUpper);

      if (!isOperator && !prevIsOperator) {
        result.push('AND');
      }
    }

    result.push(effectiveToken);
  }

  return result.join(' ');
}

export async function searchPapers(query: string, start = 0, maxResults = 10): Promise<ArxivResponse> {
  const formattedQuery = formatQuery(query);
  const params = new URLSearchParams({
    search_query: formattedQuery,
    start: start.toString(),
    max_results: maxResults.toString(),
    sortBy: 'submittedDate',
    sortOrder: 'descending',
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);
    if (!response.ok) {
        console.error(`arXiv API error: ${response.status} ${response.statusText}`);
        return { totalResults: 0, startIndex: start, itemsPerPage: maxResults, entries: [] };
    }

    const xml = await response.text();
    const result = parser.parse(xml);
    const feed = result.feed;

    if (!feed) {
        return {
        totalResults: 0,
        startIndex: start,
        itemsPerPage: maxResults,
        entries: [],
        };
    }

    const totalResults = parseInt(feed['opensearch:totalResults']);
    const startIndex = parseInt(feed['opensearch:startIndex']);
    const itemsPerPage = parseInt(feed['opensearch:itemsPerPage']);

    let entriesRaw = feed.entry;
    if (!entriesRaw) {
        entriesRaw = [];
    } else if (!Array.isArray(entriesRaw)) {
        entriesRaw = [entriesRaw];
    }

    const entries = entriesRaw.map(parseEntry);

    return {
        totalResults,
        startIndex,
        itemsPerPage,
        entries,
    };
  } catch (error) {
      console.error("Error fetching from arXiv:", error);
      return { totalResults: 0, startIndex: start, itemsPerPage: maxResults, entries: [] };
  }
}

export async function getPaperById(id: string): Promise<ArxivPaper | null> {
    const params = new URLSearchParams({
        id_list: id,
    });
    try {
        const response = await fetch(`${API_URL}?${params.toString()}`);
        if (!response.ok) {
            return null;
        }
        const xml = await response.text();
        const result = parser.parse(xml);
        const feed = result.feed;

        if (!feed || !feed.entry) return null;

        let entry = feed.entry;
        if (Array.isArray(entry)) entry = entry[0];

        return parseEntry(entry);
    } catch (error) {
        console.error("Error fetching paper by ID:", error);
        return null;
    }
}
