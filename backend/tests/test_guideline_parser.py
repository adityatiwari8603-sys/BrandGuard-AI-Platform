import pymupdf

from backend.app.services.guideline_parser import guideline_parser


# Create a sample PDF in memory
document = pymupdf.open()

page = document.new_page()

page.insert_text(
    (50, 50),
    "Brand Name: BrandGuard Cloud\n"
    "Approved Uptime: 99.9%\n"
    "Brand Tone: Professional and Trustworthy"
)

# Convert PDF into bytes
pdf_bytes = document.tobytes()

document.close()


# Extract text using our parser
result = guideline_parser.extract_text(pdf_bytes)


# Display results
print("\n========== PDF EXTRACTION TEST ==========")

print("Success:", result["success"])

if result["success"]:
    print("Total Pages:", result["total_pages"])
    print("Total Characters:", result["total_characters"])

    print("\nExtracted Text:")
    print(result["text"])
else:
    print("Error:", result["error"])

print("\n========== TEST COMPLETED ==========")