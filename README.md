# BrandGuard AI

**Intelligent Brand Governance | CodeNexus India 2026 — Round 2**

BrandGuard AI is a web-based brand-content compliance prototype. It helps teams compare draft content against uploaded brand guidelines, identify configured terminology and claim violations, understand why a finding was raised, and download a compliance report for human review.

> **Live application:** https://brand-guard-ai-platform-dgt1375ui-aditya-tiwari5.vercel.app/  
> **Backend API:** https://brandguard-ai-platform.onrender.com  
> **Interactive API documentation:** https://brandguard-ai-platform.onrender.com/docs  
> **Backend health:** https://brandguard-ai-platform.onrender.com/health  
> **Source repository:** https://github.com/adityatiwari8603-sys/BrandGuard-AI-Platform

## 1. Problem

Organisations publish content through employees, agencies and AI-assisted tools. Different contributors can unintentionally use unapproved product names, outdated facts or unsupported promotional claims. These inconsistencies can weaken brand trust and create compliance risk.

## 2. Solution

BrandGuard AI provides a workflow to upload PDF brand guidelines, extract and store their text, check draft content against configured rules, display explainable findings and recommendations, and generate a downloadable PDF report. The tool is decision support: a human reviewer remains responsible for final approval and publication.

## 3. Implemented functionality

- Dashboard for the guideline and compliance workspace.
- Upload of PDF brand-guideline documents.
- Text extraction from PDFs using PyMuPDF.
- JSON-based storage of guideline metadata and extracted text.
- Rule-based checks for configured brand terminology.
- Validation of configured factual claims, including approved uptime wording.
- Detection of predefined prohibited promotional claims.
- Severity classification for findings.
- Display of evidence, guideline references and suggested corrections.
- Compliance result for content with no detected issues.
- Downloadable PDF compliance reports.
- Human-review notice to avoid presenting automated output as final approval.
- Deployed React frontend and FastAPI backend.

## 4. Technology stack

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript, Vite, HTML, CSS |
| Backend/API | Python, FastAPI, Uvicorn |
| PDF guideline parsing | PyMuPDF |
| Guideline storage | JSON-based storage |
| Compliance engine | Python rule-based validation |
| Report output | PDF compliance reports |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Source control | Git and GitHub |

## 5. Architecture and workflow

1. A user uploads a PDF brand guideline through the React application.
2. The FastAPI backend receives the file.
3. PyMuPDF extracts text and page information from the PDF.
4. Extracted guideline text and metadata are stored in JSON.
5. A user submits draft content for review.
6. The Python compliance service evaluates the content against configured terminology, factual-claim and promotional-claim rules.
7. The API returns structured findings, severity, evidence and recommendations.
8. The frontend presents the results and supports downloading a PDF report.
9. A human reviewer makes the final decision.

### Main backend modules

- `backend/app/main.py` — FastAPI application entry point and API configuration.
- `backend/app/services/guideline_parser.py` — PDF text extraction.
- `backend/app/services/guideline_storage.py` — guideline persistence.
- `backend/app/services/brand_checker.py` — configured brand-compliance checks.

## 6. Verification and test results

### Positive compliance test

Input:
```text
BrandGuard Cloud helps teams manage their cloud workflows.

Our service provides 99.9% uptime.
```

Observed result:
- No issues detected.
- Total findings: 0.
- Human review remains required.
- A PDF report was downloaded and retained in the evidence folder.

### Negative compliance test

Input:
```text
Our product is the world's number one solution.
It guarantees 100% success for every customer.
BrandGuard Cloud provides 100% uptime.
```

Observed result:
- Total findings: 4.
- High severity: 3.
- Medium severity: 1.
- Detected configured terminology mismatch: `Brand Guard Cloud` versus `BrandGuard Cloud`.
- Detected factual claim mismatch: `100% uptime` versus approved `99.9%`.
- Detected prohibited promotional claims: `world's number one solution` and `guarantees 100% success`.
- Findings included evidence, guideline references and recommendations.
- A PDF report was downloaded and retained in the evidence folder.

### PDF parser test

The existing manual test script creates a one-page PDF in memory and invokes the guideline parser. It passed when run with the project root on `PYTHONPATH`:

```powershell
$env:PYTHONPATH = (Get-Location).Path
python .\tests\test_guideline_parser.py
```

Observed output: `Success: True`, `Total Pages: 1`, `Total Characters: 93`. The extracted text contained the sample brand name, approved uptime and brand tone.

**Test classification:** this is a manual script, not a pytest test suite; it currently prints results rather than using assertions.

## 7. Evidence included in this repository

- `evidence/screenshots/dashboard.png`
- `evidence/screenshots/negative_compliance_test.png`
- `evidence/screenshots/positive_compliance_test.png`
- `evidence/deployment/render_deployment_80a8a80.png`
- `evidence/test-reports/BrandGuard_Negative_Test_Report.pdf`
- `evidence/test-reports/BrandGuard_Positive_Test_Report.pdf`

These files document the tested application states and deployment evidence.

## 8. Local development

### Prerequisites

- Python 3.12 recommended for the current environment.
- Node.js and npm.
- Git.

### Backend

From the repository root, create and activate a virtual environment, then install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
$env:PYTHONPATH = (Get-Location).Path
uvicorn backend.app.main:app --reload
```

If the deployment uses `backend` as its working directory, the production start command is:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Build the production frontend:

```powershell
npm run build
```

The production build was verified successfully. Vite emitted a bundle-size advisory for a JavaScript chunk larger than 500 kB; this is an optimisation warning, not a build failure.

## 9. Known limitations

- The current compliance engine is rule-based and checks predefined patterns; it is not an LLM- or RAG-powered system.
- Contextual brand voice and tone analysis are not implemented.
- Visual brand checks for logos, colours and typography are not implemented.
- Accessibility analysis is not implemented.
- Role-based access, collaborative approvals, comments and revision history are not implemented.
- Rule-based detection may miss paraphrased, ambiguous or context-dependent violations.
- Scanned PDFs without extractable text are not supported by the current text-extraction workflow.
- Guideline data uses JSON-based storage. On the current free Render deployment, local filesystem data may be ephemeral and should not be treated as durable long-term storage.
- The current interface does not provide a verified delete/remove workflow for uploaded guideline records.
- Automated findings are advisory and require human review.

## 10. Planned Round 3 improvements

1. **RAG-based guideline retrieval:** chunk and embed guideline documents, retrieve relevant passages for each review, and ground findings in precise source references.
2. **Visual brand consistency checker:** evaluate marketing creatives for logo usage, approved colours, typography and other visual rules.
3. **Collaborative approval workflow:** introduce roles, reviewer assignments, comments, approve/reject/change-request actions, revision history and audit logs.

## 11. Project scope changes from Round 1

The original proposal described broader capabilities such as AI-assisted tone analysis, RAG-based retrieval, visual checks, accessibility and collaborative approvals. For this round, implementation prioritised a working end-to-end core workflow: PDF upload, extraction, storage, rule-based validation, explainable findings, recommendations and PDF reporting. The advanced capabilities are explicitly retained as future work rather than represented as completed features.

## 12. Team

**Team:** WE CODE CODERS  
**Project:** BrandGuard AI  
**Event:** CodeNexus India 2026

The project repository and evidence folder contain the implementation, test outputs and deployment evidence prepared for Round 2 evaluation.

---

*Prepared for CodeNexus India 2026 Round 2. Feature descriptions and test results above reflect the verified implementation and observed test runs as of 5 November 2026.*
