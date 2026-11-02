# BrandGuard AI

### Intelligent Brand Governance Before Publication

BrandGuard AI is a brand-governance platform designed to help organisations maintain consistent, accurate and trustworthy brand communication.

It checks submitted content against approved brand guidelines and identifies potential terminology errors, factual contradictions and unsupported promotional claims before publication.

## Project Overview

Organisations publish content across multiple platforms, teams and marketing channels. Maintaining consistent brand identity and accurate messaging can be challenging.

BrandGuard AI aims to simplify this process by allowing users to upload brand guideline documents, analyse content against those guidelines and receive recommendations for improving compliance.

## Key Features

* **PDF Guideline Upload:** Upload brand guidelines in PDF format.
* **Text Extraction:** Extract guideline text using PyMuPDF.
* **Content Compliance Checking:** Compare submitted content against stored guidelines.
* **Terminology Validation:** Identify potential terminology errors.
* **Factual Contradiction Detection:** Flag potential inconsistencies with guideline information.
* **Promotional Claim Detection:** Identify unsupported promotional claims.
* **Compliance Recommendations:** Provide explanations and suggestions.
* **PDF Reports:** Generate downloadable compliance reports.

## Technology Stack

| Component         | Technologies                 |
| ----------------- | ---------------------------- |
| Frontend          | React, JavaScript, Vite, CSS |
| Backend           | Python, FastAPI              |
| PDF Processing    | PyMuPDF                      |
| Report Generation | jsPDF                        |
| Data Storage      | JSON                         |
| Development Tools | VS Code, Git, GitHub         |

## System Architecture

```text
             USER
               |
               v
       REACT FRONTEND
               |
               v
         FASTAPI BACKEND
               |
        +------+------+
        |      |      |
        v      v      v
    Guideline Content  PDF
      Parser  Checker Reports
        |
        v
    JSON Storage
        |
        v
   Compliance Results
        |
        v
    React Dashboard
```

## Application Workflow

1. The user uploads a brand guideline PDF.
2. The backend receives the document.
3. PyMuPDF extracts the guideline text.
4. Extracted information is stored in JSON format.
5. The user submits content for compliance checking.
6. The rule-based engine analyses the submitted content.
7. Potential issues and recommendations are returned.
8. The user can generate a PDF compliance report.

## Project Structure

```text
BrandGuard-AI/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   └── services/
│   │       ├── brand_checker.py
│   │       ├── guideline_parser.py
│   │       └── guideline_storage.py
│   │
│   └── tests/
│
├── frontend/
│
├── README.md
└── .gitignore
```

## Installation and Setup

### Prerequisites

* Python 3.10 or later
* Node.js and npm
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/adityatiwari8603-sys/BrandGuard-AI-Platform.git
```

```bash
cd BrandGuard-AI-Platform
```

### 2. Backend Setup

Open a terminal:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 3. Frontend Setup

Open a second terminal:

``
