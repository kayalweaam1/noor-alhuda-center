#!/bin/bash
export DATABASE_URL="mysql://root:yjHMsndXkVAANTjruBiofkRgVOrVgvkg@metro.proxy.rlwy.net:32558/railway"
echo "yes" | pnpm db:push
