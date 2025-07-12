# Statsplainer

## Running the Frontend with Docker Compose

### Development (with Hot Reload)
- Uses Vite dev server for instant updates.
- Accessible at: http://localhost:5173
- Hot reload enabled.

**Commands:**
```sh
docker-compose up
```

### Production (Static Build with NGINX)
- Builds static files and serves them with NGINX.
- Accessible at: http://localhost (port 80)
- No hot reload.

**Commands:**
```sh
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up
```

### Key Differences
| Environment   | Command(s)                                      | Port      | Hot Reload | Uses NGINX | Uses Dev Server |
|---------------|-------------------------------------------------|-----------|------------|------------|-----------------|
| Development   | `docker-compose up`                             | 5173      | Yes        | No         | Yes             |
| Production    | `docker-compose -f docker-compose.yml up`       | 80        | No         | Yes        | No              |

---

## Running with Docker

### Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) installed on your machine
 

### Launch Commands

1. Build the production Docker image:
   ```bash
   docker build -t statsplainer .
   ```

2. Run the production container:
   ```bash
   docker run -p 80:80 statsplainer
   ```

3. Access the application at [http://localhost](http://localhost)

### Using Docker Compose

You can also use Docker Compose to run the application:

```bash
docker-compose up
```

To rebuild the containers after making changes:

```bash
docker-compose up --build
```
