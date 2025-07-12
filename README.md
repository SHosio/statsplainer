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
