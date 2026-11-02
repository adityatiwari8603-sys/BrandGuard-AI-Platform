from datetime import datetime, timezone

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Application services
from app.services.brand_checker import brand_checker
from app.services.guideline_parser import guideline_parser
from app.services.guideline_storage import guideline_storage


# ==================================================
# APPLICATION CONFIGURATION
# ==================================================

app = FastAPI(
    title="BrandGuard AI",
    description=(
        "Intelligent Brand Governance Platform "
        "for content compliance and brand protection."
    ),
    version="1.0.0"
)


# ==================================================
# CORS CONFIGURATION
# Allows React frontend to communicate with FastAPI
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# REQUEST MODELS
# ==================================================

class ContentRequest(BaseModel):
    content: str


# ==================================================
# ROOT ROUTE
# ==================================================

@app.get("/")
async def root():
    return {
        "application": "BrandGuard AI",
        "tagline": "Intelligent Brand Governance. Trusted Content.",
        "version": "1.0.0",
        "status": "running",
        "documentation": "/docs"
    }


# ==================================================
# HEALTH CHECK
# ==================================================

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "application": "BrandGuard AI",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ==================================================
# APPLICATION INFORMATION
# ==================================================

@app.get("/api/v1/info")
async def application_info():
    return {
        "name": "BrandGuard AI",
        "version": "1.0.0",
        "description": "AI-powered Brand Governance Platform",
        "features": [
            "Brand guideline PDF upload",
            "Guideline text extraction",
            "Content compliance checking",
            "Terminology validation",
            "Factual claim checking",
            "Promotional claim detection",
            "Compliance reports",
            "Human review support"
        ],
        "backend": "FastAPI",
        "status": "active"
    }


# ==================================================
# CONTENT COMPLIANCE CHECKER
# ==================================================

@app.post("/api/v1/check-content")
async def check_content(request: ContentRequest):

    content = request.content.strip()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="Content cannot be empty."
        )

    # Retrieve uploaded brand guidelines
    guidelines = guideline_storage.get_all_guidelines()

    if not guidelines:
        raise HTTPException(
            status_code=400,
            detail="Please upload brand guidelines before checking content."
        )

    # Use the latest uploaded guideline
    active_guideline = guidelines[-1]

    guideline_text = active_guideline.get(
        "extracted_text",
        ""
    )

    # Perform brand compliance analysis
    result = brand_checker.check_content(
        content=content,
        guideline_text=guideline_text
    )

    # Add guideline information
    result["guideline_id"] = active_guideline.get("id")
    result["guideline_filename"] = active_guideline.get("filename")

    result["analysis_timestamp"] = (
        datetime.now(timezone.utc).isoformat()
    )

    return result


# ==================================================
# UPLOAD BRAND GUIDELINES
# ==================================================

@app.post("/api/v1/upload-guidelines")
async def upload_guidelines(file: UploadFile = File(...)):

    # Validate file extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Read uploaded file
    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded PDF is empty."
        )

    # Maximum file size: 10 MB
    max_file_size = 10 * 1024 * 1024

    if len(pdf_bytes) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="PDF file size must not exceed 10 MB."
        )

    # Validate PDF signature
    if not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file."
        )

    # Extract text from PDF
    extraction_result = guideline_parser.extract_text(pdf_bytes)

    if not extraction_result.get("success"):
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from the uploaded PDF."
        )

    extracted_text = extraction_result.get("text", "")

    if not extracted_text.strip():
        raise HTTPException(
            status_code=400,
            detail=(
                "No readable text found in this PDF. "
                "Scanned PDFs are not supported by the current version."
            )
        )

    # Save guideline information
    saved_guideline = guideline_storage.save_guideline(
        filename=file.filename,
        extracted_text=extracted_text,
        pages=extraction_result.get("pages", [])
    )

    return {
        "success": True,
        "message": "Brand guidelines uploaded successfully.",
        "guideline_id": saved_guideline["id"],
        "filename": saved_guideline["filename"],
        "uploaded_at": saved_guideline["uploaded_at"],
        "total_pages": extraction_result["total_pages"],
        "total_characters": extraction_result["total_characters"]
    }


# ==================================================
# GET ALL UPLOADED GUIDELINES
# ==================================================

@app.get("/api/v1/guidelines")
async def get_guidelines():

    guidelines = guideline_storage.get_all_guidelines()

    # Do not expose complete extracted PDF text
    guideline_list = []

    for guideline in guidelines:
        guideline_list.append({
            "id": guideline.get("id"),
            "filename": guideline.get("filename"),
            "uploaded_at": guideline.get("uploaded_at"),
            "total_pages": guideline.get("total_pages"),
            "total_characters": len(
                guideline.get("extracted_text", "")
            )
        })

    return {
        "success": True,
        "total_guidelines": len(guideline_list),
        "guidelines": guideline_list
    }