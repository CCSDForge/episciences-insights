.PHONY: help build dev lint collect compress deploy-preprod deploy-production deploy-production-no-build rollback-preprod rollback-production

help:
	@echo "Episciences Insights — Commands"
	@echo ""
	@echo "--- Local development ---"
	@echo "  make dev                         Start local development server"
	@echo "  make build                       Build static Next.js export"
	@echo "  make lint                        Run linter"
	@echo "  make collect                     Collect publication metadata from APIs"
	@echo "  make compress                    Pre-compress dataset files (.gz, .br)"
	@echo ""
	@echo "--- Deployment (Ansistrano - Static Rsync) ---"
	@echo "  make deploy-preprod              Build locally and deploy to preprod"
	@echo "  make deploy-production           Build locally and deploy to production"
	@echo "  make deploy-production-no-build  Deploy existing out/ to production without rebuilding"
	@echo "  make rollback-preprod            Rollback preprod to previous release"
	@echo "  make rollback-production         Rollback production to previous release"
	@echo ""

build:
	npm run build

dev:
	npm run dev

lint:
	npm run lint

collect:
	npm run collect

compress:
	npm run compress

# ---------------------------------------------------------------------------
# Deployment (Ansistrano)
# ---------------------------------------------------------------------------

ANSIBLE_DIR = deployment/ansible

deploy-preprod:
	@echo "Deploying to preprod..."
	cd $(ANSIBLE_DIR) && ansible-playbook deploy.yml -i inventory/preprod.ini

deploy-production:
	@echo "Deploying to production..."
	cd $(ANSIBLE_DIR) && ansible-playbook deploy.yml -i inventory/production.ini

deploy-production-no-build:
	@echo "Deploying existing build to production (skip build)..."
	cd $(ANSIBLE_DIR) && ansible-playbook deploy.yml -i inventory/production.ini -e "build_locally=false"

rollback-preprod:
	@echo "Rolling back preprod..."
	cd $(ANSIBLE_DIR) && ansible-playbook rollback.yml -i inventory/preprod.ini

rollback-production:
	@echo "Rolling back production..."
	cd $(ANSIBLE_DIR) && ansible-playbook rollback.yml -i inventory/production.ini
