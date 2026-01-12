/**
 * Structured contact data extracted from natural language input.
 * All fields optional - extraction may not find everything.
 */
export interface ContactData {
  /** Primary name (first name, full name, or nickname) */
  name?: string;

  /** Company or organization */
  company?: string;

  /** Job title or role */
  title?: string;

  /** How/where you met this person */
  meetingContext?: string;

  /** Location associated with meeting or person */
  location?: string;

  /** Categorization tags (normalized to lowercase) */
  tags?: string[];

  /** Names of people this contact knows */
  connections?: string[];

  /** Phone number (if mentioned) */
  phone?: string;

  /** Email address (if mentioned) */
  email?: string;

  /** Any additional notes that didn't fit other fields */
  notes?: string;
}

/**
 * Full contact document as stored in Firestore.
 * Includes both raw input and structured extraction.
 */
export interface Contact {
  /** Firestore document ID */
  id: string;

  /** User ID who owns this contact (from Firebase Auth) */
  userId: string;

  /** Original user input (never lose this) */
  rawNote: string;

  /** AI-extracted structured data */
  extracted: ContactData;

  /** When the contact was created */
  createdAt: Date;

  /** When the contact was last updated */
  updatedAt: Date;
}

/**
 * Input for creating a new contact.
 * Only requires the raw note - extraction happens via AI.
 */
export interface CreateContactInput {
  /** The raw text to extract contact info from */
  rawNote: string;
}

/**
 * Input for updating an existing contact.
 * Can update raw note (triggers re-extraction) or manual field edits.
 */
export interface UpdateContactInput {
  /** Contact ID to update */
  id: string;

  /** New raw note (optional - triggers re-extraction if provided) */
  rawNote?: string;

  /** Manual field overrides (merged with extracted data) */
  overrides?: Partial<ContactData>;
}

/**
 * Input for searching contacts.
 */
export interface SearchContactInput {
  /** Search query (searches both raw and extracted fields) */
  query: string;
}

/**
 * Response from Claude API extraction.
 * This is what the AI returns, which gets stored in Contact.extracted.
 */
export type ExtractionResult = ContactData;

/**
 * Input for the extractContact function.
 */
export interface ExtractContactInput {
  /** The raw text to extract contact info from */
  rawNote: string;
}

/**
 * Response from the extractContact function.
 */
export interface ExtractContactResponse {
  /** Extracted contact data */
  extracted: ContactData;

  /** Token usage for the API call */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Response from the updateContact function.
 */
export interface UpdateContactResponse {
  /** The full updated contact */
  contact: Contact;

  /** Whether extraction was triggered (rawNote changed) */
  reExtracted: boolean;

  /** Token usage (only present if re-extraction occurred) */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * A single search result match.
 */
export interface SearchMatch {
  /** Contact ID that matched */
  id: string;

  /** Relevance score from 0.0 to 1.0 */
  score: number;

  /** Brief explanation of why this matched */
  reason: string;
}

/**
 * Response from the searchContacts function.
 */
export interface SearchContactResponse {
  /** Array of matching contacts with scores */
  results: SearchMatch[];

  /** Token usage for the API call */
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
