import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Download, FileCode, RefreshCw, X } from "lucide-react";
import { api, type ExportResult } from "../lib/ipc";
import { useStore } from "../lib/store";
import type { ValidationReport } from "../lib/validator";
import { structureConfig } from "../lib/validator";

interface SubmissionCheckPanelProps {
  onClose: () => void;
}

export function SubmissionCheckPanel({ onClose }: SubmissionCheckPanelProps) {
  const project = useStore((s) => s.project);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "fail" | "warn" | "pass">("all");

  const runCheck = async () => {
    if (!project) return;
    setLoading(true);
    setError(null);
    setExportResult(null);
    try {
      const rep = await api.validateSubmission(project.root);
      setReport(rep);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runCheck();
  }, [project?.root]);

  const handleExportZip = async () => {
    if (!project || !report || !report.summary.canExport) return;
    setExporting(true);
    setError(null);
    try {
      const defaultZipPath = `${project.root}\\${project.name}-Submission.zip`;
      const res = await api.exportSubmissionZip(project.root, defaultZipPath);
      setExportResult(res);
      useStore.getState().toast("success", `Submission ZIP exported to ${res.zipPath}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setExporting(false);
    }
  };

  const filteredChecks = report?.checks.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  }) ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl border border-border bg-card shadow-2xl overflow-hidden text-card-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Submission Check</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Apple Swift Student Challenge Pre-Flight Validator
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notices */}
        <div className="px-6 pt-4 space-y-2.5">
          {/* In-UI Disclaimer & Status */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-200 text-xs">
            <AlertCircle size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-100">Pre-Flight Static Check</div>
              <div className="mt-0.5 text-blue-200/90">{structureConfig.disclaimers.uiDisclaimer}</div>
            </div>
          </div>

          {/* Validator Scope & Limitations (docs/VALIDATOR_LIMITS.md) */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-muted bg-muted/30 text-muted-foreground text-xs">
            <FileCode size={16} className="text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-foreground">Validator Scope & Limitations:</span> Static check for package structure, 500 MB limit, offline operation, auth/tracking SDKs, and assets. Does not run `swiftc` or Clang; cannot guarantee error-free compilation in Xcode or evaluate subjective Apple judging criteria (creativity, 3-minute experience). See <code>docs/VALIDATOR_LIMITS.md</code>.
            </div>
          </div>

          {/* Unverified Template Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>UNVERIFIED TEMPLATE:</strong> {structureConfig.disclaimers.unverifiedNotice}
            </span>
          </div>
        </div>

        {/* Metrics Bar */}
        {report && (
          <div className="px-6 py-3 border-b border-border flex items-center justify-between mt-3 bg-muted/40 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                {report.summary.passed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" title="Apple's review may catch requirements or runtime issues this pre-flight check cannot detect.">
                    <CheckCircle2 size={13} /> NO OBVIOUS PROBLEMS FOUND
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    <AlertCircle size={13} /> {report.summary.failCount} CRITICAL FAILURES
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-2 py-0.5 rounded ${filter === "all" ? "bg-accent font-semibold" : "text-muted-foreground"}`}
                >
                  All ({report.summary.totalChecks})
                </button>
                <button
                  onClick={() => setFilter("fail")}
                  className={`px-2 py-0.5 rounded ${filter === "fail" ? "bg-rose-500/20 text-rose-300 font-semibold" : "text-rose-400"}`}
                >
                  Fail ({report.summary.failCount})
                </button>
                <button
                  onClick={() => setFilter("warn")}
                  className={`px-2 py-0.5 rounded ${filter === "warn" ? "bg-amber-500/20 text-amber-300 font-semibold" : "text-amber-400"}`}
                >
                  Warn ({report.summary.warnCount})
                </button>
                <button
                  onClick={() => setFilter("pass")}
                  className={`px-2 py-0.5 rounded ${filter === "pass" ? "bg-emerald-500/20 text-emerald-300 font-semibold" : "text-emerald-400"}`}
                >
                  Pass ({report.summary.passCount})
                </button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Est. Size: ~{(report.summary.estimatedZipBytes / (1024 * 1024)).toFixed(2)} MB / 500 MB
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2.5 min-h-[220px]">
          {loading && (
            <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
              <RefreshCw className="animate-spin" size={18} /> Running pre-flight checks...
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {exportResult && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" /> {exportResult.message}
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Location: <code className="bg-emerald-950/40 px-1 py-0.5 rounded">{exportResult.zipPath}</code> (
                {(exportResult.zipSizeBytes / (1024 * 1024)).toFixed(2)} MB)
              </div>
            </div>
          )}

          {!loading && filteredChecks.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border transition-all ${
                item.status === "fail"
                  ? "border-rose-500/30 bg-rose-500/5"
                  : item.status === "warn"
                    ? "border-amber-500/30 bg-amber-500/5"
                    : "border-border bg-card/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {item.status === "fail" ? (
                    <AlertCircle size={17} className="text-rose-400 shrink-0 mt-0.5" />
                  ) : item.status === "warn" ? (
                    <AlertTriangle size={17} className="text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 size={17} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      <span>{item.name}</span>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{item.message}</div>
                  </div>
                </div>

                {item.file && (
                  <div className="shrink-0 flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded border border-border">
                    <FileCode size={12} />
                    <span>
                      {item.file}
                      {item.line ? `:${item.line}` : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 flex items-center justify-between bg-muted/20">
          <button
            onClick={() => void runCheck()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Re-run Checks
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-accent transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => void handleExportZip()}
              disabled={exporting || !report?.summary.canExport}
              title={
                !report?.summary.canExport
                  ? "Cannot export while project has critical submission failures."
                  : "Export submission ZIP"
              }
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <Download size={14} />
              {exporting ? "Exporting..." : "Export Submission ZIP"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
