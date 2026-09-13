#!/usr/bin/env zsh
# @description: Run the Neverquest development server
# @version: 1.0.0
# @group: workflows
# @shell: zsh

set -euo pipefail
cd "${0:A:h}/../.."
exec npm start
