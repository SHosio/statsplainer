# --- Stage 1: Build the React app ---
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # Copy package and lock files first for better caching
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy the rest of the frontend code
    COPY . .
    
    # Build the production version (Vite's default output is /dist)
    RUN npm run build
    
    # --- Stage 2: Serve the built app with NGINX ---
    FROM nginx:stable-alpine
    
    # Copy build output to NGINX's html folder
    COPY --from=build /app/dist /usr/share/nginx/html
    
    # Expose port 80 (default NGINX port)
    EXPOSE 80
    
    # Start NGINX
    CMD ["nginx", "-g", "daemon off;"]
    