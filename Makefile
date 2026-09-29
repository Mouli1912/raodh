.PHONY: up down seed test replay demo

up:
	docker-compose up -d

down:
	docker-compose down

seed:
	python seed/load_seed.py

test:
	pytest backend/tests

replay:
	python eval/replay.py

demo:
	bash demo/fire_alert.sh
