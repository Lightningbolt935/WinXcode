#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Preview baseline runner for WinXcode Phase 0.
    Opens each corpus Swift file in the XWinCode Canvas and records the result.

.DESCRIPTION
    This script is a MANUAL GUIDE, not a fully-headless runner.
    The Canvas preview is embedded in the Tauri desktop app UI.
    Run it after `npm run tauri dev` succeeds.

    For each corpus app:
    1. Open XWinCode
    2. File -> Open -> select the .swift file path shown below
    3. Wait for the Canvas pane to render (or error)
    4. Record the result in docs/BASELINE.md

.NOTES
    Fully-automated headless Canvas testing requires:
    - Playwright or similar driving the WebView2 window
    - Exporting a screenshot via the existing capture.rs API
    This is a Phase 1+ task. For Phase 0, run manually.
#>

$repoRoot = Split-Path $PSScriptRoot -Parent
$corpusDir = Join-Path $repoRoot "tests\corpus"
$baselineFile = Join-Path $repoRoot "docs\BASELINE.md"

$apps = @(
    @{ id = "01"; dir = "01_counter";     name = "Counter";     primary = "@State, Button, Text"                      }
    @{ id = "02"; dir = "02_quiz";        name = "Quiz";        primary = "NavigationStack, NavigationLink"           }
    @{ id = "03"; dir = "03_todo";        name = "Todo";        primary = "List, ForEach, swipeActions"               }
    @{ id = "04"; dir = "04_onboarding";  name = "Onboarding";  primary = "TabView(.page), @AppStorage"              }
    @{ id = "05"; dir = "05_settings";    name = "Settings";    primary = "Form, Toggle, Picker, DatePicker"          }
    @{ id = "06"; dir = "06_drawing";     name = "Drawing";     primary = "Canvas, Path, DragGesture"                 }
    @{ id = "07"; dir = "07_charts";      name = "Charts";      primary = "Chart, BarMark, LineMark"                  }
    @{ id = "08"; dir = "08_game";        name = "Game";        primary = "TimelineView, Canvas"                      }
    @{ id = "09"; dir = "09_observable";  name = "@Observable"; primary = "@Observable macro, @Environment, @Bindable" }
    @{ id = "10"; dir = "10_accessibility"; name = "A11y";      primary = "@ScaledMetric, accessibilityAdjustableAction" }
)

Write-Host ""
Write-Host "=== WinXcode Phase 0 — Canvas Preview Baseline ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prerequisites:"
Write-Host "  1. Rust installed: rustup default stable"
Write-Host "  2. App running:    npm run tauri dev  (in XWinCode/)"
Write-Host ""
Write-Host "For each app below, open the .swift file in XWinCode and record the Canvas result."
Write-Host ""
Write-Host "Status legend:"
Write-Host "  R  = renders correctly"
Write-Host "  RW = renders-wrong (visible but incorrect)"
Write-Host "  CR = crashes or throws an error"
Write-Host "  U  = unsupported (shows unsupported panel/placeholder)"
Write-Host ""

$results = @()

foreach ($app in $apps) {
    $swiftFile = Join-Path $corpusDir "$($app.dir)\ContentView.swift"
    Write-Host "--- App $($app.id): $($app.name) ---" -ForegroundColor Yellow
    Write-Host "    File: $swiftFile"
    Write-Host "    Key constructs: $($app.primary)"
    Write-Host ""
    $status = Read-Host "    Status [R/RW/CR/U]"
    $firstFail = ""
    if ($status -in @("RW", "CR", "U")) {
        $firstFail = Read-Host "    First failing construct"
    }
    $notes = Read-Host "    Notes (optional)"
    $results += [PSCustomObject]@{
        ID = $app.id
        App = $app.name
        Constructs = $app.primary
        Status = $status.ToUpper()
        FirstFail = $firstFail
        Notes = $notes
    }
    Write-Host ""
}

# Count passes
$passes = ($results | Where-Object { $_.Status -eq "R" }).Count
Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Green
Write-Host "Pass rate: $passes / $($results.Count)"
Write-Host ""

if ($passes -ge 5) {
    Write-Host "✅ GO — pass rate meets threshold. Proceed to Phase 1." -ForegroundColor Green
} else {
    Write-Host "⚠️  BELOW THRESHOLD — $passes/10 pass. Review go/no-go decision before Phase 1." -ForegroundColor Red
}

Write-Host ""
Write-Host "Appending results to $baselineFile ..."

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
$md = "`n`n---`n`n## Actual Run Results — $timestamp`n`n"
$md += "| # | App | Status | First Failing Construct | Notes |`n"
$md += "|---|---|---|---|---|`n"
foreach ($r in $results) {
    $md += "| $($r.ID) | $($r.App) | $($r.Status) | $($r.FirstFail) | $($r.Notes) |`n"
}
$md += "`n**Pass rate: $passes / $($results.Count)**`n"
if ($passes -ge 5) {
    $md += "`n✅ **GO** — proceed to Phase 1.`n"
} else {
    $md += "`n⚠️ **BELOW THRESHOLD** — review go/no-go before Phase 1.`n"
}

Add-Content -Path $baselineFile -Value $md
Write-Host "Done. See $baselineFile" -ForegroundColor Green
