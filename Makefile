.PHONY: help dev build start lint test mcp-start mcp-health mcp-verify mcp-test propagate-posts validate-propagation linkedin-setup linkedin-publish medium-prep medium-publish deploy-vercel clean

MCP_DIR ?= /home/chemacabeza/Repositories/vercel-mcp-server.git

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
	@echo "Vercel MCP Server & Monitoring:"
	@echo "  make mcp-start              Start Vercel MCP Monitor Server in background/foreground"
	@echo "  make mcp-health             Run live MCP health audit for chemacabeza-dev"
	@echo "  make mcp-verify             Verify MCP server tool listing and SSE endpoint"
	@echo "  make mcp-test               Run Vitest test suite inside vercel-mcp-server"
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
	@echo "  make deploy-vercel          Trigger Vercel REST API deployment"
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

mcp-start:
	@if [ -d "$(MCP_DIR)" ]; then \
		echo "🚀 Starting Vercel MCP Server from $(MCP_DIR)..."; \
		npm start --prefix $(MCP_DIR); \
	else \
		echo "Error: MCP directory $(MCP_DIR) not found."; \
		exit 1; \
	fi

mcp-health:
	@if [ -f .env.local ]; then \
		export $$(grep -v '^#' .env.local | xargs) && npm run mcp:health; \
	else \
		npm run mcp:health; \
	fi

mcp-verify:
	@if [ -f .env.local ]; then \
		export $$(grep -v '^#' .env.local | xargs) && npm run mcp:verify; \
	else \
		npm run mcp:verify; \
	fi

mcp-test:
	@if [ -d "$(MCP_DIR)" ]; then \
		npm test --prefix $(MCP_DIR); \
	else \
		echo "Error: MCP directory $(MCP_DIR) not found."; \
		exit 1; \
	fi

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

deploy-vercel:
	@if [ -f .env.local ]; then \
		token=$$(grep VERCEL_TOKEN .env.local | cut -d '=' -f2); \
		if [ -n "$$token" ]; then \
			curl -s -X POST -H "Authorization: Bearer $$token" -H "Content-Type: application/json" \
				"https://api.vercel.com/v13/deployments?teamId=team_kRgssrFf4jfQZrZSdtwkrPkN" \
				-d '{"name":"chemacabeza-dev","project":"prj_ReNm8gNoARPOTuCZQLcn1EdxiJmH","gitSource":{"type":"github","org":"chemacabeza","repo":"chemacabeza-dev","ref":"master"},"target":"production"}'; \
		else \
			echo "Error: VERCEL_TOKEN missing in .env.local"; \
			exit 1; \
		fi \
	else \
		echo "Error: .env.local file not found."; \
		exit 1; \
	fi

clean:
	rm -rf .next out node_modules/.cache
