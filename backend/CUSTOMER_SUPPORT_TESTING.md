# Customer registration and support-ticket API testing

Run the backend from the `backend` directory after configuring the local MySQL connection and JWT settings.

## Configuration

Create or update `src/main/resources/application.yaml` (do not commit real passwords or JWT secrets):

```yaml
spring:
  application:
    name: api
  datasource:
    url: jdbc:mysql://localhost:3306/ecommerce_db
    username: root
    password: YOUR_MYSQL_PASSWORD
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        format_sql: true

jwt:
  secret: "REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_BYTES_LONG"
  expiration: 3600000
```

Use the same JWT secret for Admin and Customer tokens. Keep the secret outside source control.

## Start the application

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.`mvnw.cmd` spring-boot:run
```

The API is expected at `http://localhost:8080`.

The existing development initializer creates the default Admin account:
- username: `admin`
- password: `admin123`

Change this development credential before any public deployment.

## 1. Register a customer

`POST /api/customer/auth/register`

```json
{
  "fullName": "Test Customer",
  "email": "customer@example.com",
  "password": "Customer@12345",
  "phone": "9876543210"
}
```

Expected: HTTP 201 with a JWT token and role `CUSTOMER`. Copy the token.

## 2. Customer login

`POST /api/customer/auth/login`

```json
{
  "email": "customer@example.com",
  "password": "Customer@12345"
}
```

Expected: HTTP 200 with a new CUSTOMER token.

## 3. Create a support ticket

`POST /api/support/tickets`

Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

```json
{
  "subject": "Order delivery question",
  "description": "I would like an update on my order delivery.",
  "category": "DELIVERY"
}
```

Expected: HTTP 201 with a ticket whose status is `OPEN`. Save its `id`.

## 4. View the customer's tickets

`GET /api/support/tickets/mine`

Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

Expected: HTTP 200 with only the authenticated customer's tickets.

## 5. View one of the customer's tickets

`GET /api/support/tickets/{ticketId}`

Header: `Authorization: Bearer <CUSTOMER_TOKEN>`

Expected: HTTP 200 for the owner's ticket. A different customer's ticket should return HTTP 404.

## 6. Admin login

`POST /api/auth/login`

```json
{
  "username": "admin",
  "password": "admin123"
}
```

Expected: HTTP 200 with an ADMIN token. Copy it.

## 7. Admin views all support tickets

`GET /api/admin/support/tickets`

Header: `Authorization: Bearer <ADMIN_TOKEN>`

Expected: HTTP 200 with all support tickets.

## 8. Admin responds and updates ticket status

`PATCH /api/admin/support/tickets/{ticketId}`

Header: `Authorization: Bearer <ADMIN_TOKEN>`

```json
{
  "status": "IN_PROGRESS",
  "adminResponse": "We are checking this with our delivery team."
}
```

Allowed statuses: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.

Expected: HTTP 200 with the updated ticket.

## 9. Customer checks the response

Call `GET /api/support/tickets/{ticketId}` again using the CUSTOMER token. The customer should see the updated status and Admin response.

## Authorization checks

- No token on `POST /api/support/tickets`: expect HTTP 401.
- CUSTOMER token on `GET /api/admin/support/tickets`: expect HTTP 403.
- ADMIN token on `POST /api/support/tickets`: expect HTTP 403.
- CUSTOMER A requesting CUSTOMER B's ticket ID: expect HTTP 404.
- Duplicate customer email registration: expect HTTP 409.
- Invalid email, missing required fields, or password shorter than 10 characters: expect HTTP 400.

This change adds the backend API. A customer-support page and Admin support dashboard in the React frontend are separate UI work and are not included in this backend change.
