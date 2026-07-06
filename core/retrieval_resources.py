import json
import pickle
from configs.models import EMBEDDING_MODEL, TOP_K
import faiss

from sentence_transformers import SentenceTransformer

MODEL_NAME = SentenceTransformer(EMBEDDING_MODEL)


print("Loading embedding model...")
embedding_model = MODEL_NAME

print("Loading FAISS index...")
faiss_index = faiss.read_index(
    "artifacts/faiss.index"
)

print("Loading embedding IDs...")
with open(
    "artifacts/embedding_ids.json"
) as f:
    embedding_ids = json.load(f)

print("Loading BM25...")
with open(
    "artifacts/bm25_index.pkl",
    "rb"
) as f:
    bm25_data = pickle.load(f)

print("Retrieval resources loaded.")