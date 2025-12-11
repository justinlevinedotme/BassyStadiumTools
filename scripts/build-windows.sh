#!/bin/bash
# Build Windows exe and copy to shared folder with timestamp

set -e

echo "Building Windows exe..."
pnpm tauri build --target x86_64-pc-windows-gnu

# Get timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Find the exe
EXE_PATH="src-tauri/target/x86_64-pc-windows-gnu/release/fm-stadium-tools.exe"

if [ -f "$EXE_PATH" ]; then
    DEST="/windows-shared/fm-stadium-tools_${TIMESTAMP}.exe"
    cp "$EXE_PATH" "$DEST"
    echo "Copied to: $DEST"

    # Also copy as latest
    cp "$EXE_PATH" "/windows-shared/fm-stadium-tools_latest.exe"
    echo "Copied to: /windows-shared/fm-stadium-tools_latest.exe"
else
    echo "ERROR: exe not found at $EXE_PATH"
    exit 1
fi

echo "Build complete!"
