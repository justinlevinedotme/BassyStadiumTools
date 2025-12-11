# FM Stadium Tools DevContainer
# Tauri development environment with Windows cross-compilation support

FROM mcr.microsoft.com/devcontainers/rust:1-bookworm

# Switch to root for installations
USER root

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install pnpm globally
RUN npm install -g pnpm

# Install Tauri dependencies for Linux development
RUN apt-get update && apt-get install -y \
    libwebkit2gtk-4.1-dev \
    libappindicator3-dev \
    librsvg2-dev \
    patchelf \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Windows cross-compilation toolchain
RUN apt-get update && apt-get install -y \
    gcc-mingw-w64-x86-64 \
    g++-mingw-w64-x86-64 \
    && rm -rf /var/lib/apt/lists/*

# Switch back to vscode user
USER vscode

# Add Windows target for Rust
RUN rustup target add x86_64-pc-windows-gnu

# Configure cargo for Windows cross-compilation
RUN mkdir -p ~/.cargo \
    && echo '[target.x86_64-pc-windows-gnu]' >> ~/.cargo/config.toml \
    && echo 'linker = "x86_64-w64-mingw32-gcc"' >> ~/.cargo/config.toml

# Install Tauri CLI
RUN cargo install tauri-cli

# Set working directory
WORKDIR /workspace
