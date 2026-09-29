# Walkthrough

Exact demo commands in order:

```bash
# 1. Start infrastructure services
make up

# 2. Seed database and Hindsight memory bank
make seed

# 3. Fire sample incident alert
bash demo/fire_alert.sh

# 4. Run replay evaluation comparison
make replay
```
