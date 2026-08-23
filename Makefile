.PHONY: help dev build start lint test propagate-posts validate-propagation linkedin-setup linkedin-publish medium-prep medium-publish clean

## help: Display available Makefile commands
help:
	@echo "chemacabeza-dev Makefile - Available Commands:"
	@echo ""
	@echo "Development & Build:"
	@echo "  make dev                    Run Next.js dev server"
	@echo "  make build                  Build Next.js production site"
	@echo "  make start                  Start production server locally"
	@echo "  make lint                   Run ESLint static analysis"
	@echo "  make test                   Run workspace test suite"
	@echo ""
	@echo "Content Propagation & Social Publishing:"
	@echo "  make propagate-posts        Run content propagation CLI for MDX blog posts"
	@echo "  make validate-propagation   Validate post propagation states"
	@echo "  make linkedin-setup         Run LinkedIn OAuth setup workflow"
	@echo "  make linkedin-publish       Publish queued blurb to LinkedIn"
	@echo "  make medium-prep            Prepare MDX post artifacts for Medium"
	@echo "  make medium-publish         Publish queued post to Medium"
	@echo ""
	@echo "Deployment & Maintenance:"
	@echo "  make clean                  Clean Next.js build cache and output"
	@echo ""

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

test:
	npm run test

propagate-posts:
	npm run propagate:posts

validate-propagation:
	npm run validate:post-propagation

linkedin-setup:
	npm run linkedin:setup

linkedin-publish:
	npm run linkedin:publish

medium-prep:
	npm run medium:prep

medium-publish:
	npm run medium:publish

clean:
	rm -rf .next out node_modules/.cache
