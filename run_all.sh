#!/usr/bin/env bash
set -e

# Function to execute a benchmark step sequentially with a pause
run_step() {
  echo ""
  echo "#################################################################"
  echo "▶ RUNNING: ./dev.sh $@"
  echo "#################################################################"
  
  sudo bash ./dev.sh "$@"
  
  echo ""
  echo "✔ FINISHED: ./dev.sh $@"
  echo "⏳ Pausing for 5 seconds to ensure clean tear-down..."
  sleep 5
  echo "-----------------------------------------------------------------"
}

echo "🚀 STAY CALM! Running all benchmarks sequentially..."
echo "This may take a SIGNIFICANT amount of time (32 runs)."
echo "================================================================="

# -----------------------------
# Baseline (8GB RAM)
# -----------------------------
run_step baseline
run_step baseline --index
run_step baseline --schema
run_step baseline --replica

# -----------------------------
# Moderate (6GB RAM)
# -----------------------------
run_step moderate
run_step moderate --index
run_step moderate --schema
run_step moderate --replica

# -----------------------------
# Constrained (3GB RAM)
# -----------------------------
run_step constrained
run_step constrained --index
run_step constrained --schema
run_step constrained --replica


# -----------------------------
# Unbearable (2GB RAM)
# -----------------------------
run_step unbearable --replica
run_step unbearable
run_step unbearable --index
run_step unbearable --schema

echo ""
echo "======================================================="
echo "✅ All Benchmarks Completed Successfully!"
