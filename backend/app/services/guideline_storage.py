import json
from pathlib import Path
from datetime import datetime, timezone


class GuidelineStorage:

    def __init__(self):

        # Create data directory in project root
        self.data_dir = Path(__file__).resolve().parents[3] / "data"

        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.storage_file = self.data_dir / "guidelines.json"

        # Create JSON file if it does not exist
        if not self.storage_file.exists():
            self.storage_file.write_text(
                json.dumps({"guidelines": []}, indent=4),
                encoding="utf-8"
            )

    def get_all_guidelines(self):

        try:
            with open(self.storage_file, "r", encoding="utf-8") as file:
                data = json.load(file)

            return data.get("guidelines", [])

        except (json.JSONDecodeError, OSError):
            return []

    def save_guideline(self, filename, extracted_text, pages):

        guidelines = self.get_all_guidelines()

        guideline = {
            "id": len(guidelines) + 1,
            "filename": filename,
            "uploaded_at": datetime.now(timezone.utc).isoformat(),
            "total_pages": len(pages),
            "extracted_text": extracted_text,
            "pages": pages
        }

        guidelines.append(guideline)

        # Save safely using a temporary file
        temporary_file = self.storage_file.with_suffix(".tmp")

        with open(temporary_file, "w", encoding="utf-8") as file:
            json.dump(
                {"guidelines": guidelines},
                file,
                indent=4,
                ensure_ascii=False
            )

        temporary_file.replace(self.storage_file)

        return guideline


# Create storage instance
guideline_storage = GuidelineStorage()