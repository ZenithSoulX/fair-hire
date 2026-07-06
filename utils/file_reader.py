from pathlib import Path
import fitz 
import docx

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

    document = fitz.open(path)

    text = ""

    for page in document:
        text += page.get_text()

    document.close()

    return text


def read_docx(path: Path):

    doc = docx.Document(path)

    return "\n".join(
        p.text
        for p in doc.paragraphs
    )