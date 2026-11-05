#!/bin/sh
# Configures Git to use shared hooks in .githooks directory
git config core.hooksPath .githooks
echo "✅ Git hooks path set to .githooks"
