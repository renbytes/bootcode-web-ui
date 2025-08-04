# Makefile for the Spex Community Hub frontend application

# Use .PHONY to declare targets that are not actual files.
# This prevents conflicts if a file with the same name as a target exists.
.PHONY: help install dev build serve lint format test

# Default command to run when 'make' is called without arguments.
default: help

help:
	@echo "Available commands:"
	@echo "  install   - Install project dependencies from package.json"
	@echo "  dev       - Start the local development server (http://localhost:5173)"
	@echo "  run       - Alias for 'dev'"
	@echo "  build     - Build the application for production"
	@echo "  serve     - Serve the production build locally"
	@echo "  lint      - Run the ESLint linter"
	@echo "  format    - Format code with Prettier"
	@echo "  test      - Run the test suite with Vitest"

install:
	@echo "Installing dependencies..."
	npm install

# Start the development server
dev:
	npm run dev

# 'run' is a common command, so we add it as an alias for 'dev'.
run: dev

# Build the project for production
build:
	npm run build

# Preview the production build
serve:
	npm run serve

# Lint and format code
lint:
	npm run lint

format:
	npm run format

# Run tests
test:
	npm run test