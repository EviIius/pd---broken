from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
from rag_processor import BankingRAGProcessor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Banking Document RAG Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG processor
rag_processor = None

class DocumentQuery(BaseModel):
    query: str
    risk_type: Optional[str] = None
    document_type: Optional[str] = None
    top_k: int = 5

class DocumentProcessRequest(BaseModel):
    documents: List[Dict[str, Any]]

class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    total_chunks: int
    query: str

@app.on_event("startup")
async def startup_event():
    """Initialize RAG processor on startup."""
    global rag_processor
    logger.info("Initializing Banking RAG Processor...")
    rag_processor = BankingRAGProcessor()
    
    # Try to load existing vector store
    vector_store_path = "./data/banking_vector_store"
    if os.path.exists(f"{vector_store_path}.faiss"):
        try:
            rag_processor.load_vector_store(vector_store_path)
            logger.info("Loaded existing vector store")
        except Exception as e:
            logger.error(f"Failed to load vector store: {e}")
            logger.info("Will create new vector store when documents are processed")
    else:
        logger.info("No existing vector store found. Will create new one when documents are processed")

@app.get("/")
async def root():
    """Health check endpoint."""
    return {"message": "Banking Document RAG Service is running"}

@app.get("/health")
async def health_check():
    """Detailed health check."""
    global rag_processor
    return {
        "status": "healthy",
        "rag_processor_initialized": rag_processor is not None,
        "total_chunks": len(rag_processor.vector_store.chunks) if rag_processor else 0
    }

@app.post("/process_documents")
async def process_documents(request: DocumentProcessRequest):
    """Process and index banking documents."""
    global rag_processor
    
    if not rag_processor:
        raise HTTPException(status_code=500, detail="RAG processor not initialized")
    
    try:
        logger.info(f"Processing {len(request.documents)} documents...")
        rag_processor.process_banking_documents(request.documents)
        
        # Save the vector store
        vector_store_path = "./data/banking_vector_store"
        os.makedirs("./data", exist_ok=True)
        rag_processor.save_vector_store(vector_store_path)
        
        return {
            "message": "Documents processed successfully",
            "documents_processed": len(request.documents),
            "total_chunks": len(rag_processor.vector_store.chunks)
        }
    except Exception as e:
        logger.error(f"Error processing documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")

@app.post("/search", response_model=SearchResponse)
async def search_documents(query: DocumentQuery):
    """Search for relevant document chunks."""
    global rag_processor
    
    if not rag_processor:
        raise HTTPException(status_code=500, detail="RAG processor not initialized")
    
    if len(rag_processor.vector_store.chunks) == 0:
        raise HTTPException(status_code=400, detail="No documents have been processed yet")
    
    try:
        logger.info(f"Searching for: {query.query}")
        results = rag_processor.search_banking_context(
            query=query.query,
            risk_type=query.risk_type,
            document_type=query.document_type,
            top_k=query.top_k
        )
        
        return SearchResponse(
            results=results,
            total_chunks=len(rag_processor.vector_store.chunks),
            query=query.query
        )
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")

@app.get("/stats")
async def get_stats():
    """Get statistics about the indexed documents."""
    global rag_processor
    
    if not rag_processor or len(rag_processor.vector_store.chunks) == 0:
        return {
            "total_chunks": 0,
            "unique_documents": 0,
            "document_types": [],
            "risk_types": []
        }
    
    chunks = rag_processor.vector_store.chunks
    
    # Collect statistics
    unique_docs = set()
    doc_types = set()
    risk_types = set()
    
    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        unique_docs.add(metadata.get("document_id", ""))
        doc_types.add(metadata.get("type", "Unknown"))
        risk_types.add(metadata.get("risk_type", "Unknown"))
    
    return {
        "total_chunks": len(chunks),
        "unique_documents": len(unique_docs),
        "document_types": sorted(list(doc_types)),
        "risk_types": sorted(list(risk_types))
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
