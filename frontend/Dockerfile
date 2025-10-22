# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy public folder first (required by React)
COPY public/ ./public/

# Copy src folder
COPY src/ ./src/

# Copy tsconfig.json
COPY tsconfig.json ./

# Expose port 3000
EXPOSE 3000

# Set environment variable for API URL
ENV REACT_APP_API_URL=http://localhost:5000/api

# Start the development server
CMD ["npm", "start"]