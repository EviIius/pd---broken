import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Optional
import tiktoken
from pathlib import Path
import pickle
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentEmbedder:
    """Handles document chunking and embedding for RAG."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """Initialize with sentence transformer model."""
        self.model = SentenceTransformer(model_name)
        self.encoding = tiktoken.get_encoding("cl100k_base")
        self.chunk_size = 512
        self.chunk_overlap = 50
        
    def chunk_text(self, text: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks with metadata."""
        # Tokenize text
        tokens = self.encoding.encode(text)
        chunks = []
        
        # Create overlapping chunks
        for i in range(0, len(tokens), self.chunk_size - self.chunk_overlap):
            chunk_tokens = tokens[i:i + self.chunk_size]
            chunk_text = self.encoding.decode(chunk_tokens)
            
            # Skip very short chunks
            if len(chunk_text.strip()) < 50:
                continue
                
            chunk = {
                "text": chunk_text.strip(),
                "metadata": metadata.copy(),
                "chunk_index": len(chunks),
                "token_count": len(chunk_tokens)
            }
            chunks.append(chunk)
            
        return chunks
    
    def embed_chunks(self, chunks: List[Dict[str, Any]]) -> np.ndarray:
        """Generate embeddings for text chunks."""
        texts = [chunk["text"] for chunk in chunks]
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings

class FAISSVectorStore:
    """FAISS-based vector store for document retrieval."""
    
    def __init__(self, dimension: int = 384):  # all-MiniLM-L6-v2 dimension
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)  # Inner product (cosine similarity)
        self.chunks = []
        
    def add_documents(self, chunks: List[Dict[str, Any]], embeddings: np.ndarray):
        """Add document chunks and embeddings to the vector store."""
        # Normalize embeddings for cosine similarity
        faiss.normalize_L2(embeddings)
        
        # Add to FAISS index
        self.index.add(embeddings.astype('float32'))
        
        # Store chunk metadata
        self.chunks.extend(chunks)
        
        logger.info(f"Added {len(chunks)} chunks to vector store. Total: {len(self.chunks)}")
    
    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for most similar document chunks."""
        # Normalize query embedding
        query_embedding = query_embedding.reshape(1, -1)
        faiss.normalize_L2(query_embedding)
        
        # Search FAISS index
        scores, indices = self.index.search(query_embedding.astype('float32'), top_k)
        
        # Return results with metadata
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx >= 0:  # Valid index
                chunk = self.chunks[idx].copy()
                chunk["similarity_score"] = float(score)
                results.append(chunk)
                
        return results
    
    def save(self, path: str):
        """Save the vector store to disk."""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        # Save FAISS index
        faiss.write_index(self.index, f"{path}.faiss")
        
        # Save chunks metadata
        with open(f"{path}.chunks", "wb") as f:
            pickle.dump(self.chunks, f)
            
        logger.info(f"Saved vector store to {path}")
    
    def load(self, path: str):
        """Load the vector store from disk."""
        # Load FAISS index
        self.index = faiss.read_index(f"{path}.faiss")
        
        # Load chunks metadata
        with open(f"{path}.chunks", "rb") as f:
            self.chunks = pickle.load(f)
            
        logger.info(f"Loaded vector store from {path} with {len(self.chunks)} chunks")

class RAGDocumentProcessor:
    """Main class for processing documents and creating RAG-ready vector store."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.embedder = DocumentEmbedder(model_name)
        self.vector_store = FAISSVectorStore()
        
    def process_documents(self, documents: List[Dict[str, Any]]):
        """Process a list of documents into the vector store."""
        all_chunks = []
        
        for doc in documents:
            # Extract document content
            title = doc.get("title", "")
            content = doc.get("content", "")
            summary = doc.get("summary", "")
            
            # Combine title, summary, and content for better context
            full_text = f"Title: {title}\n\nSummary: {summary}\n\nContent: {content}"
            
            # Create metadata
            metadata = {
                "document_id": doc.get("id", ""),
                "title": title,
                "date": doc.get("date", ""),
                "type": doc.get("type", ""),
                "level": doc.get("level", ""),
                "business_group": doc.get("business_group", ""),
                "region": doc.get("region", ""),
                "risk_type": doc.get("risk_type", ""),
                "source_link": doc.get("source_link", "")
            }
            
            # Chunk the document
            chunks = self.embedder.chunk_text(full_text, metadata)
            all_chunks.extend(chunks)
            
        logger.info(f"Created {len(all_chunks)} chunks from {len(documents)} documents")
        
        # Generate embeddings
        embeddings = self.embedder.embed_chunks(all_chunks)
        
        # Add to vector store
        self.vector_store.add_documents(all_chunks, embeddings)
        
    def search_documents(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Search for relevant document chunks given a query."""
        # Generate query embedding
        query_embedding = self.embedder.model.encode([query], convert_to_numpy=True)
        
        # Search vector store
        results = self.vector_store.search(query_embedding, top_k)
        
        return results
    
    def save_vector_store(self, path: str):
        """Save the vector store to disk."""
        self.vector_store.save(path)
    
    def load_vector_store(self, path: str):
        """Load the vector store from disk."""
        self.vector_store.load(path)

# Banking-specific document processor
class BankingRAGProcessor(RAGDocumentProcessor):
    """Specialized RAG processor for banking documents."""
    
    def __init__(self):
        # Use a model that's good for financial/legal text
        super().__init__(model_name="all-MiniLM-L6-v2")
        
    def process_banking_documents(self, documents: List[Dict[str, Any]]):
        """Process banking documents with specialized handling."""
        enhanced_docs = []
        
        for doc in documents:
            # Enhance document with banking-specific context
            enhanced_doc = doc.copy()
            
            # Add regulatory context to content
            content = doc.get("content", "")
            if content:
                # Add regulatory markers for better retrieval
                regulatory_context = f"""
REGULATORY DOCUMENT: {doc.get('type', 'Banking Document')}
RISK TYPE: {doc.get('risk_type', 'General')}
PUBLICATION DATE: {doc.get('date', 'Unknown')}
REGULATORY LEVEL: {doc.get('level', 'Unknown')}

{content}
"""
                enhanced_doc["content"] = regulatory_context
                
            enhanced_docs.append(enhanced_doc)
            
        # Process with enhanced content
        self.process_documents(enhanced_docs)
        
    def search_banking_context(self, query: str, risk_type: Optional[str] = None, 
                             document_type: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        """Enhanced search with banking-specific filtering."""
        # Enhance query with banking context
        enhanced_query = f"Banking regulation: {query}"
        if risk_type:
            enhanced_query += f" Risk type: {risk_type}"
        if document_type:
            enhanced_query += f" Document type: {document_type}"
            
        # Search with enhanced query
        results = self.search_documents(enhanced_query, top_k * 2)  # Get more results for filtering
        
        # Filter results based on criteria
        filtered_results = []
        for result in results:
            metadata = result.get("metadata", {})
            
            # Apply filters
            if risk_type and metadata.get("risk_type", "").lower() != risk_type.lower():
                continue
            if document_type and metadata.get("type", "").lower() != document_type.lower():
                continue
                
            filtered_results.append(result)
            
            if len(filtered_results) >= top_k:
                break
                
        return filtered_results[:top_k]
