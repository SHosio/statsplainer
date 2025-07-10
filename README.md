# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


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
