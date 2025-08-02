# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create build directory
RUN mkdir -p build

# Expose port
EXPOSE 3000

# Set environment variable for development
ENV NODE_ENV=development
ENV REACT_APP_API_URL=http://localhost:8000

# Start the development server
CMD ["npm", "start"]
