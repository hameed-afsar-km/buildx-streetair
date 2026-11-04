"""
STREETAIR AI Engine — RAG Text Chunking
=========================================
Splits documents into semantically useful chunks with controlled overlap,
preserving headings, metadata, and structural context.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class TextChunk:
    chunk_id: str
    text: str
    chunk_index: int
    char_start: int
    char_end: int
    section_title: str | None = None


def chunk_text(
    text: str,
    chunk_size: int = 500,
    chunk_overlap: int = 100,
    min_chunk_size: int = 50,
) -> list[TextChunk]:
    """
    Split text into overlapping chunks, attempting to break on paragraph or sentence boundaries.
    Detects markdown section headers (# Header).
    """
    if not text or not text.strip():
        return []

    lines = text.split("\n")
    current_section = "General"
    chunks: list[TextChunk] = []

    # Identify sections by headings
    current_chunk_text: list[str] = []
    current_char_count = 0
    chunk_idx = 0
    start_char = 0

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("#"):
            header_title = stripped.lstrip("#").strip()
            current_section = header_title

        line_len = len(line) + 1  # count newline
        if current_char_count + line_len > chunk_size and current_chunk_text:
            combined = "\n".join(current_chunk_text).strip()
            if len(combined) >= min_chunk_size:
                chunks.append(
                    TextChunk(
                        chunk_id=f"chunk_{chunk_idx}",
                        text=combined,
                        chunk_index=chunk_idx,
                        char_start=start_char,
                        char_end=start_char + len(combined),
                        section_title=current_section,
                    )
                )
                chunk_idx += 1

            # Retain overlap lines if possible
            overlap_lines: list[str] = []
            overlap_len = 0
            for l in reversed(current_chunk_text):
                if overlap_len + len(l) + 1 <= chunk_overlap:
                    overlap_lines.insert(0, l)
                    overlap_len += len(l) + 1
                else:
                    break

            current_chunk_text = overlap_lines
            current_char_count = overlap_len
            start_char += (len(combined) - overlap_len)

        current_chunk_text.append(line)
        current_char_count += line_len

    if current_chunk_text:
        combined = "\n".join(current_chunk_text).strip()
        if len(combined) >= min_chunk_size:
            chunks.append(
                TextChunk(
                    chunk_id=f"chunk_{chunk_idx}",
                    text=combined,
                    chunk_index=chunk_idx,
                    char_start=start_char,
                    char_end=start_char + len(combined),
                    section_title=current_section,
                )
            )

    return chunks

