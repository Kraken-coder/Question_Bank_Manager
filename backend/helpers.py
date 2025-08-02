"""
gemini_ocr_demo.py

Illustrates how to push many kinds of documents to Gemini,
get OCR / text extraction back in Markdown, and print the result.
"""

import os
import mimetypes
import subprocess
import tempfile
import pathlib
from typing import Tuple
from config import GOOGLE_API_KEY
from google import genai
from google.genai import types

# -------------------------------
# 1.  CONFIGURE GEMINI CLIENT
# -------------------------------
API_KEY = GOOGLE_API_KEY
client = genai.Client(api_key=API_KEY)  # Developer API – files.upload works here

# -------------------------------
# 2.  MIME-TYPE HELPERS & CONVERT
# -------------------------------

def _convert_office_to_pdf(src: pathlib.Path) -> pathlib.Path:
    """
    Use docx2pdf (Windows/macOS) or LibreOffice (Linux) to turn DOCX/PPTX/etc → PDF.
    """
    dst = src.with_suffix(".pdf")
    try:
        from docx2pdf import convert  # quick path on Win/Mac
        convert(str(src), str(dst))
    except Exception:
        # Fallback: LibreOffice headless (works cross-platform if LO installed)
        subprocess.run(
            ["libreoffice", "--headless", "--convert-to", "pdf", str(src),
             "--outdir", str(src.parent)],
            check=True,
        )
    return dst

def _convert_excel_to_csv(src: pathlib.Path) -> pathlib.Path:
    """
    XLSX → UTF-8 CSV via pandas so Gemini can read plain text.
    """
    import pandas as pd
    df = pd.read_excel(src, sheet_name=0)   # first sheet
    dst = src.with_suffix(".csv")
    df.to_csv(dst, index=False)
    return dst

def prepare_for_gemini(file_path: str) -> Tuple[pathlib.Path, str]:
    """
    Return (converted_file, mime_type) ready for files.upload().
    """
    p = pathlib.Path(file_path)
    mt, _ = mimetypes.guess_type(p)
    if mt in {"application/pdf", "image/png", "image/jpeg", "text/csv",
              "text/plain", "text/html"}:
        return p, mt
    if p.suffix.lower() in {".docx", ".pptx", ".ppt", ".odp"}:
        pdf_path = _convert_office_to_pdf(p)
        return pdf_path, "application/pdf"

    if p.suffix.lower() in {".xlsx", ".xls"}:
        csv_path = _convert_excel_to_csv(p)
        return csv_path, "text/csv"

    raise ValueError(f"Unsupported type: {p.suffix}")
def gemini_ocr(file_ready: pathlib.Path) -> str:
    """
    Uploads the document/image to Gemini and returns Markdown text.
    """
    uploaded = client.files.upload(file=str(file_ready))   
    prompt_parts = [
        "You are an OCR assistant. Extract **all readable text** from the attachment and "
        "return it formatted purely as GitHub-flavoured Markdown (retain headings if any).",
        uploaded,  
    ]
    response = client.models.generate_content(
        model="gemini-2.5-flash",        
        contents=prompt_parts,
        config=types.GenerateContentConfig(max_output_tokens=8192),
    )
    return response.text
if __name__ == "__main__":
    import argparse, textwrap, sys

    ap = argparse.ArgumentParser(
        description="Gemini OCR demo for images, PDFs, DOCX, XLSX, PPTX …",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=textwrap.dedent("""
        EXAMPLES
        --------
            python gemini_ocr_demo.py scan.jpg
            python gemini_ocr_demo.py report.docx
            python gemini_ocr_demo.py slides.pptx
            python gemini_ocr_demo.py budget.xlsx
        """),
    )
    ap.add_argument("FILE", help="Path to the document/image to OCR")
    args = ap.parse_args()

    try:
        ready_file, mime = prepare_for_gemini(args.FILE)
        md_text = gemini_ocr(ready_file, mime)
        print(md_text)
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        sys.exit(1)