# Use the official Rust image to build the binary
FROM rust:latest AS builder

# Install the necessary system dependencies
RUN apt-get update && apt-get install -y \
    libdw-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy files
COPY Cargo.toml Cargo.lock ./
COPY .cargo .cargo
COPY src src

# Add the target for x86_64 (Cloud Run architecture)
RUN rustup target add x86_64-unknown-linux-gnu

# Build the project for x86_64 architecture
RUN cargo build --release --target=x86_64-unknown-linux-gnu

# Use a minimal base image to run the binary
FROM debian:12

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libdw1 \
    ca-certificates \
    openssl \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the compiled binary from the builder image
COPY --from=builder /usr/src/app/target/x86_64-unknown-linux-gnu/release/indexer .

# Copy the configuration file
COPY config.yaml /secrets/config

# Expose the port your application is using
EXPOSE 8080

# Set the command to run the application
CMD ["./indexer", "-c", "/secrets/config"]
