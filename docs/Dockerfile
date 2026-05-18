FROM squidfunk/mkdocs-material:latest
WORKDIR /docs
COPY . .
EXPOSE 8000
CMD ["serve", "-f", "mkdocs.yml", "--dev-addr=0.0.0.0:8000"]
