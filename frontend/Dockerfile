# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port 3000
EXPOSE 3000

# Set environment variable for API URL
ENV REACT_APP_API_URL=http://localhost:5000/api

# Start the development server
CMD ["npm", "start"]