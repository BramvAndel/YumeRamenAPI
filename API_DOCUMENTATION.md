# Yume Ramen Noodles API v1.0.0

API documentation for Yume Ramen Noodles

Base URL: http://localhost:3000/api/v1

## Endpoints

### POST /auth/login

**Summary**: Login a user

**Tags**: Auth

**Request Body**:

- Content-Type: `application/json`
- **email** (string, required): The user's email.
- **password** (string, required): The user's password.

**Responses**:

- **200**: Login successful
  - Sets HTTP-only cookies:
    - `accessToken`: Valid for 15 minutes
    - `refreshToken`: Valid for 7 days
  - Response body includes `userId` and `role`
- **400**: Missing email or password
- **401**: Invalid credentials
- **500**: Internal server error

**Security**: Tokens are stored in HTTP-only cookies (protected from XSS attacks)

---

### POST /auth/refresh

**Summary**: Refresh access token

**Tags**: Auth

**Description**: Reads `refreshToken` from HTTP-only cookie and returns new `accessToken` via cookie

**Request**: No body required. Uses HTTP-only `refreshToken` cookie automatically.

**Responses**:

- **200**: New access token generated
  - Sets new `accessToken` HTTP-only cookie (15 minutes)
- **401**: Refresh token required (missing from cookies)
- **403**: Invalid or revoked refresh token

**Security**: No token needs to be passed in request body; uses secure cookies

---

### POST /auth/logout

**Summary**: Logout user (revoke refresh token)

**Tags**: Auth

**Description**: Reads `refreshToken` from HTTP-only cookie, revokes it from database, and clears both cookies

**Request**: No body required. Uses HTTP-only `refreshToken` cookie automatically.

**Responses**:

- **200**: Logged out successfully
  - Clears `accessToken` and `refreshToken` HTTP-only cookies
- **400**: Token required (missing from cookies)
- **500**: Internal server error

**Security**: No token needs to be passed in request body; uses secure cookies

---

### GET /dishes

**Summary**: Returns the list of all dishes

**Tags**: Dishes

**Responses**:

- **200**: The list of the dishes
- **500**: Internal Server Error

---

### POST /dishes

**Summary**: Create a new dish

**Description**: Requires Admin privileges

**Tags**: Dishes

**Request Body**:

- Content-Type: `multipart/form-data`
- **Name** (string, required): The name of the dish.
- **Price** (number, required): The price of the dish.
- **Ingredients** (string, required): The ingredients.
- **image** (file, optional): The dish image.

**Responses**:

- **201**: The dish was successfully created
- **400**: Missing required fields
- **500**: Internal Server Error

---

### GET /dishes/{id}

**Summary**: Get the dish by id

**Tags**: Dishes

**Parameters**:

- `id` (path): The dish id (Required)

**Responses**:

- **200**: The dish description by id
- **404**: The dish was not found
- **500**: Internal Server Error

---

### PUT /dishes/{id}

**Summary**: Update the dish by the id

**Description**: Requires Admin privileges

**Tags**: Dishes

**Parameters**:

- `id` (path): The dish id (Required)

**Request Body**:

- Content-Type: `multipart/form-data`
- **Name** (string, optional): The new name.
- **Price** (number, optional): The new price.
- **Ingredients** (string, optional): The new ingredients.
- **image** (file, optional): The new image.

**Responses**:

- **200**: The dish was updated
- **400**: No fields provided for update
- **404**: The dish was not found
- **500**: Internal Server Error

---

### DELETE /dishes/{id}

**Summary**: Remove the dish by id

**Description**: Requires Admin privileges

**Tags**: Dishes

**Parameters**:

- `id` (path): The dish id (Required)

**Responses**:

- **200**: The dish was deleted
- **404**: The dish was not found
- **500**: Internal Server Error

---

### GET /orders

**Summary**: Returns the list of all orders

**Tags**: Orders

**Responses**:

- **200**: The list of the orders
- **500**: Internal Server Error

---

### POST /orders

**Summary**: Create a new order

**Tags**: Orders

**Request Body**:

- Content-Type: `application/json`
- **items** (array, required): List of items to order. Each item must have `dishID` (integer) and `quantity` (integer).
- **delivery_address** (string, optional): The delivery address.
- **paid** (boolean, optional): Whether the order is paid (default: false).

**Responses**:

- **201**: The order was successfully created
- **400**: Missing required fields
- **500**: Internal Server Error

---

### GET /orders/{id}

**Summary**: Get the order by id

**Tags**: Orders

**Parameters**:

- `id` (path): The order id (Required)

**Responses**:

- **200**: The order description by id
- **404**: The order was not found
- **500**: Internal Server Error

---

### PUT /orders/{id}

**Summary**: Update the order by the id

**Tags**: Orders

**Parameters**:

- `id` (path): The order id (Required)

**Request Body**:

- Content-Type: `application/json`
- **Status** (string, optional): The new status of the order (ordered, processing, delivering, completed).
- **Paid** (boolean, optional): Update the paid status.

**Responses**:

- **200**: The order was updated
- **404**: The order was not found
- **500**: Internal Server Error

---

### DELETE /orders/{id}

**Summary**: Remove the order by id

**Tags**: Orders

**Parameters**:

- `id` (path): The order id (Required)

**Responses**:

- **200**: The order was deleted
- **404**: The order was not found
- **500**: Internal Server Error

---

### GET /users

**Summary**: Returns the list of all users

**Description**: Requires Admin privileges

**Tags**: Users

**Responses**:

- **200**: The list of the users
- **500**: Internal Server Error

---

### POST /users

**Summary**: Create a new user

**Tags**: Users

**Request Body**:

- Content-Type: `application/json`
- **username** (string, required): The username.
- **password** (string, required): The password.
- **email** (string, required): The email address.
- **phone_number** (string, optional): The phone number.
- **last_name** (string, optional): The last name.

**Responses**:

- **201**: The user was successfully created
- **400**: Missing required fields
- **500**: Internal Server Error

---

### GET /users/{id}

**Summary**: Get the user by id

**Tags**: Users

**Parameters**:

- `id` (path): The user id (Required)

**Responses**:

- **200**: The user description by id
- **404**: The user was not found
- **500**: Internal Server Error

---

### DELETE /users/{id}

**Summary**: Remove the user by id

**Description**: Requires Owner or Admin privileges

**Tags**: Users

**Parameters**:

- `id` (path): The user id (Required)

**Responses**:

- **200**: The user was deleted
- **404**: The user was not found
- **500**: Internal Server Error

---

### PUT /users/{id}

**Summary**: Update the user by the id

**Description**: Requires Owner or Admin privileges

**Tags**: Users

**Parameters**:

- `id` (path): The user id (Required)

**Request Body**:

- Content-Type: `application/json`
- **username** (string, optional): The new username.
- **email** (string, optional): The new email address.
- **phone_number** (string, optional): The new phone number.
- **last_name** (string, optional): The new last name.

**Responses**:

- **200**: The user was updated
- **404**: The user was not found
- **500**: Internal Server Error

---
