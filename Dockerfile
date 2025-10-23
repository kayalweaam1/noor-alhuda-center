# --- Build Stage ---
FROM node:20 AS base

# Set the working directory
WORKDIR /app

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y build-essential

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to install dependencies
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --prod=false

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm build

# --- Production Stage ---
FROM node:20-slim AS production

# Set the working directory
WORKDIR /app

# Install pnpm globally (needed for pnpm start)
RUN npm install -g pnpm

# Copy only the necessary files from the build stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY package.json ./

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD [ "pnpm", "start" ]
