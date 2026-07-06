from pathlib import Path

try:
    import fitz
    _HAS_FITZ = True
except ImportError:
    _HAS_FITZ = False

try:
    import docx
    _HAS_DOCX = True
except ImportError:
    _HAS_DOCX = False

def read_file(file_path: str) -> str:
    
    path = Path(file_path)
    suffix = path.suffix.lower()

    if suffix == ".pdf":
        return read_pdf(path)

    elif suffix == ".docx":
        return read_docx(path)

    elif suffix in [".txt", ".md"]:
        return path.read_text(encoding="utf-8")

    else:
        raise ValueError(f"Unsupported file format: {suffix}")


def read_pdf(path: Path):
    if not _HAS_FITZ:
        raise ImportError("PyMuPDF (fitz) is not installed. Run: pip install pymupdf")
    document = fitz.open(path)
    text = ""
    for page in document:
        text += page.get_text()
    document.close()
    return text


def read_docx(path: Path):
    if not _HAS_DOCX:
        raise ImportError("python-docx is not installed. Run: pip install python-docx")
    doc = docx.Document(path)
    return "\n".join(p.text for p in doc.paragraphs)