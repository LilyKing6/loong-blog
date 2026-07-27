FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled blog binary
COPY blog.lx /app/blog.lx
RUN chmod +x /app/blog.lx

# Copy static assets
COPY site/ /app/site/

EXPOSE 8080

CMD ["/app/blog.lx", "serve", "-p", "8080", "-r", "*/>{SOURCE}index.html", "-R", "site"]
