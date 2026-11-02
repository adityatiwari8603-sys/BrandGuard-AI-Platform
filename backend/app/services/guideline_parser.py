import pymupdf


class GuidelineParser:

    def extract_text(self, pdf_bytes: bytes):

        try:
            # Open PDF directly from uploaded bytes
            with pymupdf.open(
                stream=pdf_bytes,
                filetype="pdf"
            ) as document:

                extracted_pages = []

                # Extract text from every page
                for page_number, page in enumerate(document, start=1):

                    page_text = page.get_text()

                    extracted_pages.append({
                        "page": page_number,
                        "text": page_text
                    })

                # Combine text from all pages
                full_text = "\n".join(
                    page["text"] for page in extracted_pages
                )

                return {
                    "success": True,
                    "total_pages": len(document),
                    "total_characters": len(full_text),
                    "text": full_text,
                    "pages": extracted_pages
                }

        except Exception as error:

            return {
                "success": False,
                "error": str(error)
            }


# Create parser instance
guideline_parser = GuidelineParser()