import re


class BrandComplianceChecker:

    def check_content(self, content: str, guideline_text: str = ""):

        findings = []

        # Default rules
        approved_name = "BrandGuard Cloud"
        approved_uptime = "99.9%"

        prohibited_claims = [
            "Fastest platform in the world",
            "Guaranteed results",
            "Number one platform",
            "world's number one solution",
            "number one solution",
            "100% success",
            "guaranteed success",
            "guarantees 100% success"
        ]

        # Extract approved product name
        name_match = re.search(
            r"Approved name:\s*(.+)",
            guideline_text,
            re.IGNORECASE
        )

        if name_match:
            approved_name = name_match.group(1).strip()

        # Extract approved uptime
        uptime_match = re.search(
            r"Approved uptime:\s*(\d+(?:\.\d+)?%)",
            guideline_text,
            re.IGNORECASE
        )

        if uptime_match:
            approved_uptime = uptime_match.group(1)

        # Check incorrect product terminology
        if re.search(r"\bBrand Guard Cloud\b", content, re.IGNORECASE):

            findings.append({
                "category": "Terminology",
                "severity": "Medium",
                "issue": "Incorrect product name",
                "evidence": "Brand Guard Cloud",
                "guideline_reference": f"Approved name: {approved_name}",
                "recommendation": f"Use {approved_name}."
            })

        # Check incorrect uptime claims
        if re.search(r"\b100%\s+uptime\b", content, re.IGNORECASE):

            findings.append({
                "category": "Factual Accuracy",
                "severity": "High",
                "issue": "Uptime claim contradicts approved information",
                "evidence": "100% uptime",
                "guideline_reference": f"Approved uptime: {approved_uptime}",
                "recommendation": (
                    f"Replace the claim with the approved uptime "
                    f"of {approved_uptime}."
                )
            })

        # Check prohibited promotional claims
        # Longer matches take priority to avoid duplicate findings.

        matched_spans = []

        for claim in sorted(prohibited_claims, key=len, reverse=True):

            match = re.search(
                re.escape(claim),
                content,
                re.IGNORECASE
            )

            if not match:
                continue

            start, end = match.span()

            # Skip overlapping claims
            if any(
                start < old_end and end > old_start
                for old_start, old_end in matched_spans
            ):
                continue

            matched_spans.append((start, end))

            findings.append({
                "category": "Promotional Claim",
                "severity": "High",
                "issue": "Potentially unsupported promotional claim",
                "evidence": content[start:end],
                "guideline_reference": (
                    "Prohibited Promotional Claims section"
                ),
                "recommendation": (
                    "Remove this claim or provide approved "
                    "supporting evidence."
                )
            })

        # Return compliance report
        return {
            "brand": "BrandGuard AI",
            "total_issues": len(findings),
            "compliance_status": (
                "Needs Review" if findings else "No Issues Detected"
            ),
            "guidelines_used": bool(guideline_text),
            "approved_product_name": approved_name,
            "approved_uptime": approved_uptime,
            "findings": findings,
            "human_review_required": True
        }


brand_checker = BrandComplianceChecker()
