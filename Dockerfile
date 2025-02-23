FROM node:18-alpine

WORKDIR /app

# Copy package.json and lock files separately to leverage Docker cache
COPY package.json .
COPY pnpm-lock.yaml .

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install


# Copy the rest of the application
COPY . .


# Build the application (if needed)
RUN pnpm run build

# Expose port
EXPOSE 5000

# Set environment variables for database connection

COPY .env .env

# Command to run the application
CMD ["pnpm", "start"]
