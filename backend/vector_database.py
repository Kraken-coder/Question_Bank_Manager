import chromadb
import hashlib
import json
from typing import List, Optional

class VectorDatabase:
    def __init__(self):
        self.client = chromadb.PersistentClient(path="VectorDataBase")
        try:
            self.collection = self.client.create_collection("Questions")
        except Exception as e:
            print("Collection already exists, getting existing collection")
            self.collection = self.client.get_collection("Questions")
        self.use_ollama = False  # Set to False to use simple embeddings
        
    def _generate_simple_embedding(self, text: str) -> List[float]:
        """
        Generate a simple embedding using character frequency and hash-based features.
        This is a fallback when Ollama is not available.
        """
        # Convert text to lowercase for consistency
        text = text.lower()
        
        # Create a simple embedding based on character frequencies and text features
        embedding = [0.0] * 384  # Standard embedding size
        
        # Character frequency features
        char_counts = {}
        for char in text:
            if char.isalnum():
                char_counts[char] = char_counts.get(char, 0) + 1
        
        # Fill embedding with normalized character frequencies
        for i, char in enumerate('abcdefghijklmnopqrstuvwxyz0123456789'):
            if i < len(embedding):
                embedding[i] = char_counts.get(char, 0) / len(text) if len(text) > 0 else 0
        
        # Add word-based features
        words = text.split()
        if len(words) > 0:
            # Average word length
            avg_word_len = sum(len(word) for word in words) / len(words)
            if len(embedding) > 50:
                embedding[50] = avg_word_len / 20  # Normalize
            
            # Number of words (normalized)
            if len(embedding) > 51:
                embedding[51] = min(len(words) / 100, 1.0)  # Cap at 100 words
        
        # Use text hash for additional features
        text_hash = hashlib.md5(text.encode()).hexdigest()
        for i, char in enumerate(text_hash[:20]):  # Use first 20 hex chars
            if 52 + i < len(embedding):
                embedding[52 + i] = int(char, 16) / 15.0  # Normalize hex digit
        
        return embedding
    def search(self , query , n_results=5):
        """
        Searches for similar documents based on the query text.
        Returns a list of IDs of similar documents.
        """
        query_embedding = self._generate_embedding(query)
        
        # Query the collection for similar documents
        query_result = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )
        print(self.collection.get())
        print(query_result)
        # Extract results
        distances = query_result["distances"][0]
        ids = query_result["ids"][0]
        
        # Return IDs of similar documents
        return ids[:n_results]
    def _generate_embedding(self, text: str) -> List[float]:
        """
        Generates an embedding for the given text.
        Falls back to simple embedding if Ollama is not available.
        """
        if self.use_ollama:
            try:
                import ollama
                response = ollama.embed(model='nomic-embed-text', input=text)
                return response['embeddings'][0]
            except Exception as e:
                print(f"Ollama embedding failed: {e}")
                print("Falling back to simple embedding")
                return self._generate_simple_embedding(text)
        else:
            return self._generate_simple_embedding(text)

    def insert(self, text, id):
        """
        Generates an embedding for the text and inserts it into the database.
        """
        embedding_vector = self._generate_embedding(text=text)
        
        # The upsert method expects lists for ids, embeddings, and documents.
        self.collection.upsert(
            ids=[str(id)],
            embeddings=[embedding_vector],
            documents=[text]
        )
    def update_question(self, id, text):
        """
        Updates the text for a given ID by generating a new embedding.
        """
        embedding_vector = self._generate_embedding(text=text)
        
        # The upsert method expects lists for ids, embeddings, and documents.
        self.collection.upsert(
            ids=[id],
            embeddings=[embedding_vector],
            documents=[text]
        )
    def check_redundant_data(self, threshold, n=2):
        """
        Finds redundant documents by querying for nearest neighbors in ChromaDB.
        Returns IDs of documents whose nearest neighbor's distance is below the threshold.
        """
        all_data = self.collection.get()
        ids = all_data["ids"]
        redundant_ids = set()

        for i, doc_id in enumerate(ids):
            # Get the embedding for the current document
            current_doc = self.collection.get(ids=[doc_id], include=['embeddings'])
            current_embedding = current_doc["embeddings"][0]  # Extract the actual embedding vector
            
            query_result = self.collection.query(
                query_embeddings=[current_embedding],  # Pass as a list containing the embedding
                n_results=n,
            )
            # Skip self-match (distance 0), check next closest
            distances = query_result["distances"][0]
            print(f"Distances for {doc_id}: {distances}")
            neighbor_ids = query_result["ids"][0]
            for dist, neighbor_id in zip(distances[1:], neighbor_ids[1:]):
                if dist < threshold:
                    redundant_ids.add(doc_id)
                    redundant_ids.add(neighbor_id)
        return list(redundant_ids)
    def delete_id(self , id):
        self.collection.delete(ids = str(id))
    
    def find_similar_data(self, text, threshold=0.8, n_results=5):
        """
        Finds documents similar to the given text.
        Returns IDs of documents whose similarity is above the threshold.
        """
        # Generate embedding for the input text
        query_embedding = self._generate_embedding(text)
        
        # Query the collection for similar documents
        query_result = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )
        
        # Extract results
        distances = query_result["distances"][0]
        ids = query_result["ids"][0]
        
        # Filter IDs based on threshold (lower distance = higher similarity)
        # For distance-based similarity, we want distances below (1 - threshold)
        distance_threshold = 1 - threshold
        similar_ids = []
        
        for distance, doc_id in zip(distances, ids):
            if distance < distance_threshold:
                similar_ids.append(doc_id)
        
        return similar_ids

if __name__ == "__main__":
    print("Testing VectorDatabase class...")
    db = VectorDatabase()

    # To ensure a clean test, you might want to clear the collection.
    # The current `delete_id` is for specific IDs. A `clear_collection` method might be useful.
    # For this test, we'll assume the collection is either new or we're okay with existing data.
    
    # 1. Test insertion
    print("\n--- Testing Insertion ---")
    documents = {
        "id1": "The Indian Navy is the naval branch of the Indian Armed Forces.",
        "id2": "ChromaDB is an open-source embedding database.",
        "id3": "The Indian Navy is the naval branch of the Indian Armed Forces.", # Duplicate of id1
        "id4": "Ollama allows you to run large language models locally."
    }
    for doc_id, text in documents.items():
        print(f"Inserting document with id: {doc_id}")
        db.insert(text=text, id=doc_id)
    
    print("\nDocuments currently in collection:")
    print(db.collection.get(include=['documents']))

    # 2. Test redundancy check
    print("\n--- Testing Redundancy Check ---")
    # Using a high threshold to catch near-identical sentences.
    redundant_ids = db.check_redundant_data(threshold=0.98)
    print(f"Redundant document IDs found: {redundant_ids}")

    # 3. Test deletion
    print("\n--- Testing Deletion ---")
    if redundant_ids:
        print(f"Deleting redundant documents: {redundant_ids}")
        db.delete_id(id=redundant_ids)
    else:
        print("No redundant documents to delete.")

    # 4. Verify state after deletion
    print("\nDocuments in collection after deleting redundant items:")
    print(db.collection.get(include=['documents']))
    
    # 5. Test find similar data
    print("\n--- Testing Find Similar Data ---")
    test_query = "What is the role of the Indian Navy?"
    similar_ids = db.find_similar_data(test_query, threshold=0.7)
    print(f"Documents similar to '{test_query}': {similar_ids}")
    
    print("\n--- Test Complete ---")