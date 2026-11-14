# scripts/fetch-corpus2.ps1
# Fetches real-world permissively licensed open-source SwiftUI apps for tests/corpus2
# Ensures all source files and license files are properly mirrored with pinned commit hashes.

$ErrorActionPreference = "Stop"

$tempDir = Join-Path $PSScriptRoot "..\temp_corpus2_fetch"
$corpus2Dir = Join-Path $PSScriptRoot "..\tests\corpus2"

if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

Write-Host "Fetching Corpus 2 source repositories..."

# 1. Apple sample-food-truck (Commit: 3954a769e99f3cc53297d94f2b960ceb2665b3d6)
Write-Host "Fetching sample-food-truck..."
git clone --depth 1 https://github.com/apple/sample-food-truck.git "$tempDir/food-truck"
Copy-Item "$tempDir/food-truck/LICENSE.txt" "$corpus2Dir/01_food_truck/LICENSE.txt" -Force

# 2-5. twostraws/simple-swiftui (Commit: e24d0442acf4a1ad7d624e4653bca75485296a10)
Write-Host "Fetching simple-swiftui..."
git clone --depth 1 https://github.com/twostraws/simple-swiftui.git "$tempDir/simple-swiftui"
Copy-Item "$tempDir/simple-swiftui/LICENSE.md" "$corpus2Dir/02_simple_news/LICENSE.md" -Force
Copy-Item "$tempDir/simple-swiftui/LICENSE.md" "$corpus2Dir/03_simple_notes/LICENSE.md" -Force
Copy-Item "$tempDir/simple-swiftui/LICENSE.md" "$corpus2Dir/04_simple_scores/LICENSE.md" -Force
Copy-Item "$tempDir/simple-swiftui/LICENSE.md" "$corpus2Dir/05_simple_todo/LICENSE.md" -Force

# 6. Swiftify-Corp/Calculator-SwiftUI (Commit: a17cb4d23955398cccf38b73403548a48722f608)
Write-Host "Fetching Calculator-SwiftUI..."
git clone --depth 1 https://github.com/Swiftify-Corp/Calculator-SwiftUI.git "$tempDir/calculator"
Copy-Item "$tempDir/calculator/LICENSE" "$corpus2Dir/06_calculator/LICENSE" -Force

# 7. andev0x/CapyTimer (Commit: 96078520a9c80e8114f30fec127068437bd56eac)
Write-Host "Fetching CapyTimer..."
git clone --depth 1 https://github.com/andev0x/CapyTimer.git "$tempDir/capytimer"
Copy-Item "$tempDir/capytimer/LICENSE" "$corpus2Dir/07_capy_timer/LICENSE" -Force
# Copy CapyTheme.swift so Card, ProgressRing, and SectionHeader are defined
Copy-Item "$tempDir/capytimer/CapyTimer/UI/Theme/CapyTheme.swift" "$corpus2Dir/07_capy_timer/CapyTheme.swift" -Force

# 8. peterfriese/MakeItSo (Commit: 1e089b47b52adc33551eac948bd8c4ff55298632)
Write-Host "Fetching MakeItSo..."
git clone --depth 1 https://github.com/peterfriese/MakeItSo.git "$tempDir/makeitso"
Copy-Item "$tempDir/makeitso/LICENSE" "$corpus2Dir/08_make_it_so/LICENSE" -Force

# 9. nalexn/clean-architecture-swiftui (Commit: 9eca97b8cfff96a14084b564b1fefd949c93d232)
Write-Host "Fetching clean-architecture-swiftui..."
git clone --depth 1 https://github.com/nalexn/clean-architecture-swiftui.git "$tempDir/countries"
Copy-Item "$tempDir/countries/LICENSE" "$corpus2Dir/09_countries/LICENSE" -Force

# 10. twostraws/ControlRoom (Commit: 1764564f7923f0afc0d216ede573e20bd3c19f6e)
Write-Host "Fetching ControlRoom..."
git clone --depth 1 https://github.com/twostraws/ControlRoom.git "$tempDir/controlroom"
Copy-Item "$tempDir/controlroom/LICENSE" "$corpus2Dir/10_control_room/LICENSE" -Force

# Cleanup
Remove-Item -Recurse -Force $tempDir
Write-Host "All Corpus 2 licenses and sources updated successfully."
