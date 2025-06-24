export interface ClusterPoint {
  x: number;
  y: number;
  topic: string; // Corresponds to Topic id
  text: string;   // Document text snippet or identifier
  // Add any other properties a data point might have
}

export interface Topic {
  id: string;
  name: string;
  count: number;
  percentage: string; // e.g., "33.5%"
  summary?: string;    // Optional summary for the topic
  color?: string;      // Optional: for UI elements like the dot
}

// You can define other shared types here, for example, for API responses
export interface ClusteringAPIParams {
  documents: string[]; // Or a more complex data structure
  num_clusters: number;
  algorithm: string;
  selected_columns: string[];
  all_headers?: string[]; // If needed by backend
}

export interface ClusteringAPIResult {
  // Define the structure of what your backend will return
  message: string;
  topics: Topic[];
  clusterPoints: ClusterPoint[];
  // Include any other data like topic distribution, etc.
}

export interface FilterState {
  publicationDate: string | null;
  documentType: string[];
  level: string[];
  owningBusinessGroup: string[];
  region: string[];
  riskType: string[];
  topic: string[];
  controlProcedure: boolean | null;
  policyCategory: string | null;
  policySubCategory: string | null;
  controlCategory: string | null;
  controlSubCategory: string | null;
}

export type FilterStateWithMeta = FilterState;

export interface Document {
  id: string;
  title: string;
  category: string; // This will be documentType
  content: string;
  publicationDate: string;
  level: string;
  owningBusinessGroup: string;
  region?: string;
  riskType?: string;
  topic?: string;
}

export interface AIFeedback {
  messageId: string;
  rating: 'helpful' | 'not_helpful';
  category?: string;
  comment?: string;
  timestamp: Date;
}
