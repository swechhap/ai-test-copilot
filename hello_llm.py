"""Smallest possible LLM call: send a prompt, print the raw response.

Run: python hello_llm.py
"""
import os

import requests
from dotenv import load_dotenv

load_dotenv()

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

response = requests.post(
    f"{OLLAMA_HOST}/api/chat",
    json={
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": "say hello"}],
        "stream": False,
    },
    timeout=60,
)
response.raise_for_status()
data = response.json()

print("--- raw response JSON ---")
print(data)
print("\n--- model's message ---")
print(data["message"]["content"])
