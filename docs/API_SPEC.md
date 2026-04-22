# API Specification (MVP)

## Base URL

/api

---

## Auth

### POST /api/auth/login

- Handled by NextAuth

---

## Students

### GET /api/students

Get all students

### POST /api/students

Create student

---

## Devices

### GET /api/devices

Get all devices

### POST /api/devices

Create device

---

## Transactions

### POST /api/transactions/borrow

Request:

```json
{
  "studentId": "string",
  "deviceId": "string"
}
```

Response:

```json
{
  "status": "success",
  "data": {}
}
```

---

### POST /api/transactions/return

Request:

```json
{
  "transactionId": "string",
  "condition": "Normal | Damaged"
}
```

---

### GET /api/transactions

Get all transactions

---

## Dashboard

### GET /api/dashboard

Response:

```json
{
  "totalDevices": 10,
  "availableDevices": 5,
  "inUseDevices": 5,
  "activeTransactions": 5
}
```
