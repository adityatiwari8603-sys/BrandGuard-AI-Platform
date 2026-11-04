import { useEffect, useState } from "react";

import {
  ShieldCheck,
  LayoutDashboard,
  FileText,
  ScanSearch,
  BarChart3,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Loader2,
  FileCheck2,
  Sparkles,
  Menu,
  RefreshCw,
  Download,
} from "lucide-react";

import "./App.css";
import { downloadComplianceReport } from "./utils/reportGenerator";

const API = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function App() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [guidelines, setGuidelines] = useState([]);
  const [content, setContent] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Guidelines", icon: FileText },
    { name: "Content Checker", icon: ScanSearch },
    { name: "Reports", icon: BarChart3 },
  ];

  // Load uploaded guidelines
  const loadGuidelines = async () => {
    try {
      const response = await fetch(`${API}/api/v1/guidelines`);

      if (!response.ok) {
        throw new Error("Could not load guidelines.");
      }

      const data = await response.json();
      setGuidelines(data.guidelines || []);
    } catch (err) {
      setError("Backend connection failed. Make sure FastAPI is running.");
    }
  };

  useEffect(() => {
    loadGuidelines();
  }, []);

  // Upload guideline PDF
  const uploadGuideline = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API}/api/v1/upload-guidelines`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed.");
      }

      setMessage(`Successfully uploaded ${data.filename}`);
      await loadGuidelines();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  // Analyze submitted content
  const checkContent = async () => {
    if (!content.trim()) {
      setError("Please enter content to check.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setReport(null);

    try {
      const response = await fetch(`${API}/api/v1/check-content`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Content analysis failed.");
      }

      setReport(data);
      setActiveTab("Reports");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Report statistics
  const highIssues =
    report?.findings?.filter((item) => item.severity === "High").length || 0;

  const mediumIssues =
    report?.findings?.filter((item) => item.severity === "Medium").length || 0;

  const totalIssues = report?.total_issues || 0;

  // Display report findings
  const renderFindings = () => {
    if (!report) {
      return (
        <div className="empty-state">
          <FileCheck2 size={42} />
          <h3>No analysis report yet</h3>
          <p>
            Submit content through the Content Checker to generate a report.
          </p>

          <button
            className="primary-button"
            onClick={() => setActiveTab("Content Checker")}
          >
            Check Content <ArrowUpRight size={16} />
          </button>
        </div>
      );
    }

    if (report.findings.length === 0) {
      return (
        <div className="success-box">
          <CheckCircle2 size={30} />

          <div>
            <h3>No issues detected</h3>
            <p>
              The current rule-based checks did not identify any violations.
              Human review is still recommended.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="findings-list">
        {report.findings.map((finding, index) => (
          <div className="finding-card" key={index}>
            <div className="finding-top">
              <span className="finding-category">{finding.category}</span>

              <span className={`severity ${finding.severity.toLowerCase()}`}>
                {finding.severity}
              </span>
            </div>

            <h3>{finding.issue}</h3>

            <div className="finding-detail">
              <span>Detected evidence</span>
              <p>{finding.evidence}</p>
            </div>

            <div className="finding-detail">
              <span>Guideline reference</span>
              <p>{finding.guideline_reference}</p>
            </div>

            <div className="recommendation">
              <Sparkles size={16} />

              <div>
                <strong>Recommended correction</strong>
                <p>{finding.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <h2>BrandGuard</h2>
            <span>AI GOVERNANCE</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="navigation">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activeTab === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActiveTab(item.name);
                  setMobileMenu(false);
                  setError("");
                  setMessage("");
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldCheck size={21} />

            <div>
              <strong>Brand protection</strong>
              <p>Human-controlled review</p>
            </div>
          </div>

          <div className="user-profile">
            <div className="avatar">BG</div>

            <div>
              <strong>Brand Workspace</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
          >
            <Menu size={22} />
          </button>

          <div>
            <span className="breadcrumb">BrandGuard AI /</span>
            <strong>{activeTab}</strong>
          </div>

          <div className="topbar-right">
            <span className="system-status">
              <span className="status-dot"></span>
              System ready
            </span>

            <div className="top-avatar">BG</div>
          </div>
        </header>

        <div className="page-content">
          {/* Alerts */}
          {error && (
            <div className="alert alert-error">
              <AlertTriangle size={18} />
              {error}
              <button onClick={() => setError("")}>×</button>
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              {message}
              <button onClick={() => setMessage("")}>×</button>
            </div>
          )}

          {/* OVERVIEW */}
          {activeTab === "Overview" && (
            <>
              <section className="welcome-section">
                <div>
                  <div className="eyebrow">
                    <Sparkles size={15} />
                    INTELLIGENT BRAND GOVERNANCE
                  </div>

                  <h1>Protect your brand identity.</h1>

                  <p>
                    Review content, enforce brand guidelines and identify
                    compliance issues before publication.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActiveTab("Content Checker")}
                >
                  <ScanSearch size={17} />
                  Check Content
                </button>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Guidelines uploaded</span>
                    <FileText size={19} />
                  </div>

                  <h2>{guidelines.length}</h2>
                  <p>Saved brand documents</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Latest issues detected</span>
                    <AlertTriangle size={19} />
                  </div>

                  <h2>{totalIssues}</h2>
                  <p>From your latest analysis</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>High severity issues</span>
                    <XCircle size={19} />
                  </div>

                  <h2>{highIssues}</h2>
                  <p>Require attention</p>
                </div>

                <div className="stat-card">
                  <div className="stat-heading">
                    <span>Workspace status</span>
                    <ShieldCheck size={19} />
                  </div>

                  <h2 className="status-text">Active</h2>
                  <p>Backend integration</p>
                </div>
              </section>

              <section className="overview-grid">
                <div className="panel quick-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Quick actions</h2>
                      <p>Start protecting your brand content.</p>
                    </div>
                  </div>

                  <button
                    className="action-row"
                    onClick={() => setActiveTab("Guidelines")}
                  >
                    <div className="action-icon purple">
                      <Upload size={20} />
                    </div>

                    <div>
                      <strong>Upload brand guidelines</strong>
                      <span>Add your approved brand PDF.</span>
                    </div>

                    <ArrowUpRight size={18} />
                  </button>

                  <button
                    className="action-row"
                    onClick={() => setActiveTab("Content Checker")}
                  >
                    <div className="action-icon blue">
                      <ScanSearch size={20} />
                    </div>

                    <div>
                      <strong>Analyze content</strong>
                      <span>Check terminology and claims.</span>
                    </div>

                    <ArrowUpRight size={18} />
                  </button>

                  <button
                    className="action-row"
                    onClick={() => setActiveTab("Reports")}
                  >
                    <div className="action-icon green">
                      <BarChart3 size={20} />
                    </div>

                    <div>
                      <strong>View latest report</strong>
                      <span>Review detected compliance issues.</span>
                    </div>

                    <ArrowUpRight size={18} />
                  </button>
                </div>

                <div className="panel guideline-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Brand knowledge</h2>
                      <p>Your uploaded guideline documents.</p>
                    </div>

                    <button
                      className="icon-button"
                      onClick={loadGuidelines}
                      title="Refresh"
                    >
                      <RefreshCw size={17} />
                    </button>
                  </div>

                  {guidelines.length === 0 ? (
                    <div className="mini-empty">
                      <FileText size={30} />
                      <p>No guidelines uploaded yet.</p>

                      <button
                        className="text-button"
                        onClick={() => setActiveTab("Guidelines")}
                      >
                        Upload your first PDF
                      </button>
                    </div>
                  ) : (
                    <div className="guideline-list">
                      {guidelines.slice(0, 4).map((item) => (
                        <div className="guideline-row" key={item.id}>
                          <div className="pdf-icon">PDF</div>

                          <div>
                            <strong>{item.filename}</strong>
                            <span>
                              {item.total_pages} pages ·{" "}
                              {item.total_characters} characters
                            </span>
                          </div>

                          <CheckCircle2 size={18} className="green-icon" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <div className="disclaimer">
                <ShieldCheck size={18} />

                <p>
                  BrandGuard AI provides automated rule-based checks. Results
                  should be reviewed by an authorised human before publication.
                </p>
              </div>
            </>
          )}

          {/* GUIDELINES */}
          {activeTab === "Guidelines" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">BRAND KNOWLEDGE HUB</div>
                  <h1>Brand guidelines</h1>

                  <p>
                    Upload and manage your approved brand guideline documents.
                  </p>
                </div>
              </section>

              <section className="panel upload-panel">
                <div className="upload-icon">
                  <Upload size={27} />
                </div>

                <h2>Upload your brand guidelines</h2>

                <p>
                  Select a text-based PDF containing approved terminology,
                  brand rules and product information.
                </p>

                <label className="upload-button">
                  {uploading ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Choose PDF document
                    </>
                  )}

                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={uploadGuideline}
                    disabled={uploading}
                    hidden
                  />
                </label>

                <span className="upload-note">
                  PDF format · Maximum file size: 10 MB
                </span>
              </section>

              <section className="panel document-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Uploaded documents</h2>
                    <p>{guidelines.length} document(s) in your workspace</p>
                  </div>

                  <button
                    className="icon-button"
                    onClick={loadGuidelines}
                    title="Refresh"
                  >
                    <RefreshCw size={17} />
                  </button>
                </div>

                {guidelines.length === 0 ? (
                  <div className="mini-empty">
                    <FileText size={34} />
                    <p>Your uploaded documents will appear here.</p>
                  </div>
                ) : (
                  <div className="guideline-list">
                    {guidelines.map((item) => (
                      <div className="guideline-row" key={item.id}>
                        <div className="pdf-icon">PDF</div>

                        <div>
                          <strong>{item.filename}</strong>
                          <span>
                            {item.total_pages} pages ·{" "}
                            {item.total_characters} characters
                          </span>
                        </div>

                        <span className="document-status">
                          <CheckCircle2 size={15} />
                          Saved
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {/* CONTENT CHECKER */}
          {activeTab === "Content Checker" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">COMPLIANCE ENGINE</div>
                  <h1>Content checker</h1>

                  <p>
                    Evaluate your content against the uploaded brand
                    guidelines.
                  </p>
                </div>
              </section>

              <section className="panel checker-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Submit content for analysis</h2>

                    <p>
                      Paste marketing copy, product descriptions or other
                      brand communication.
                    </p>
                  </div>

                  <div className="checker-badge">
                    <ShieldCheck size={15} />
                    Rule-based analysis
                  </div>
                </div>

                <label className="input-label">CONTENT TO REVIEW</label>

                <textarea
                  className="content-input"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder={`Paste your content here...

Example:
Our Brand Guard Cloud platform provides 100% uptime and guaranteed results.`}
                />

                <div className="textarea-footer">
                  <span>{content.length} characters</span>

                  <span>
                    {guidelines.length} guideline document(s) available
                  </span>
                </div>

                <button
                  className="primary-button analyze-button"
                  onClick={checkContent}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="spin" size={18} />
                      Analyzing content...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze content
                    </>
                  )}
                </button>
              </section>

              <div className="disclaimer">
                <AlertTriangle size={18} />

                <p>
                  This prototype checks configured terminology, uptime and
                  promotional-claim rules. It does not yet provide full AI,
                  tone or visual analysis.
                </p>
              </div>
            </>
          )}

          {/* REPORTS */}
          {activeTab === "Reports" && (
            <>
              <section className="page-heading">
                <div>
                  <div className="eyebrow">ANALYSIS RESULTS</div>
                  <h1>Compliance report</h1>

                  <p>
                    Review findings and recommended corrections from your
                    latest content check.
                  </p>
                </div>

                {report && (
                  <div className="report-actions">
                    <span
                      className={`report-status ${
                        totalIssues > 0 ? "needs-review" : "clear"
                      }`}
                    >
                      {report.compliance_status}
                    </span>

                    <button
                      className="primary-button"
                      onClick={() =>
                        downloadComplianceReport(report, content)
                      }
                    >
                      <Download size={17} />
                      Download PDF
                    </button>
                  </div>
                )}
              </section>

              {report && (
                <section className="stats-grid report-stats">
                  <div className="stat-card">
                    <div className="stat-heading">
                      <span>Total findings</span>
                      <ScanSearch size={19} />
                    </div>

                    <h2>{totalIssues}</h2>
                    <p>Detected by current checks</p>
                  </div>

                  <div className="stat-card">
                    <div className="stat-heading">
                      <span>High severity</span>
                      <XCircle size={19} />
                    </div>

                    <h2>{highIssues}</h2>
                    <p>Priority findings</p>
                  </div>

                  <div className="stat-card">
                    <div className="stat-heading">
                      <span>Medium severity</span>
                      <AlertTriangle size={19} />
                    </div>

                    <h2>{mediumIssues}</h2>
                    <p>Review recommended</p>
                  </div>
                </section>
              )}

              <section className="panel report-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Detailed findings</h2>

                    <p>
                      Evidence, guideline references and recommended
                      corrections.
                    </p>
                  </div>
                </div>

                {renderFindings()}
              </section>

              {report && (
                <div className="disclaimer">
                  <ShieldCheck size={18} />

                  <p>
                    Human review required:{" "}
                    {report.human_review_required ? "Yes" : "No"}. Automated
                    results are decision-support information, not final
                    publication approval.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="footer">
          <span>BrandGuard AI © 2026</span>
          <span>Intelligent Brand Governance · Trusted Content</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
