# BasketBro - Your Basket. Your World.

BasketBro is a full-stack e-commerce application built with React and Spring Boot. It provides a product browsing experience with search, filtering, product details, shopping cart functionality, and an administrative interface for managing products.


## Features

### Customer Experience

* Browse and view product details.
* Search and filter products.
* Sort and paginate product listings.
* Add products to the shopping cart.
* Proceed through the checkout and payment interface.

### Administration

* Administrator login.
* Protected administrative routes.
* Product management operations.
* Create, update, and delete products.
* Upload product images.

> **Note:** The checkout and payment interfaces are part of the application. Their production readiness and payment-provider integration have not yet been verified.

## Technology Stack

### Frontend

* React
* Vite
* JavaScript
* HTML and CSS

### Backend

* Java
* Spring Boot
* Spring Data JPA / Hibernate
* Spring Security
* JWT authentication
* Maven

### Database

* MySQL

## Project Structure

```text
BasketBro-Ecommerce/
â”œâ”€â”€ frontend/
â”‚   â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ vite.config.js
â”œâ”€â”€ backend/
â”‚   â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ images/
â”‚   â”œâ”€â”€ pom.xml
â”‚   â””â”€â”€ mvnw.cmd
â”œâ”€â”€ .gitignore
â””â”€â”€ README.md
```

## Prerequisites

Install the following software before running the application:

* Node.js and npm
* Java Development Kit (JDK)
* MySQL
* Git

## Backend Setup

### 1. Configure the database

Create a MySQL database named `ecommerce_db`.

```sql
CREATE DATABASE ecommerce_db;
```

### 2. Configure application settings

The repository provides an example configuration at:

`backend/src/main/resources/application-example.yaml`

Use it as a reference for configuring the backend's database connection and JWT secret.

The application needs these environment variables:

| Variable      | Purpose                     |
| ------------- | --------------------------- |
| `DB_URL`      | MySQL JDBC connection URL   |
| `DB_USERNAME` | MySQL username              |
| `DB_PASSWORD` | MySQL password              |
| `JWT_SECRET`  | Secret used for JWT signing |

Provide the variables through your local environment or a secure configuration mechanism. Never commit actual credentials or production secrets to Git.

### 3. Start the backend

Open a terminal in the `backend/` directory.

On Windows, run:

```powershell
.\mvnw.cmd spring-boot:run
```

The example configuration is a template. Ensure your active Spring Boot configuration resolves the required environment variables before starting the application.

## Frontend Setup

Open a terminal in the `frontend/` directory.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API base URL

Create a local `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Adjust the URL if the backend runs on another host or port.

### 3. Start the frontend

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

### 4. Create a production build

```bash
npm run build
```

The production files are generated in `frontend/dist/`.

## Security

* Do not commit database passwords, JWT secrets, API keys, or environment files containing credentials.
* Use a strong, securely generated JWT secret.
* Use HTTPS and production-appropriate security settings when deploying.
* Configure production secrets through environment variables or a secrets manager.

## Current Status

BasketBro's frontend production build and backend Maven package build have completed successfully in the local development environment.

The frontend dependency audit reported zero known vulnerabilities after the dependency updates applied during development.

Runtime integration, deployment readiness, and production payment processing require separate verification.

## Future Improvements

Potential next steps include:

* Automated unit and integration tests.
* Production deployment and environment-specific configuration.
* Persistent order management and verified payment-provider integration.
* Improved observability and error handling.
* CI/CD automation.

## License

No license has been specified yet. All rights and licensing terms remain subject to the repository owner's decision.


