# Database Schema (Prisma)

```prisma
enum DeviceStatus {
  AVAILABLE
  IN_USE
}

enum TransactionStatus {
  ACTIVE
  COMPLETED
}

model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  password String
  role     String
}

model Student {
  id        String @id @default(cuid())
  name      String
  class     String
  createdAt DateTime @default(now())

  transactions Transaction[]
}

model Device {
  id        String @id @default(cuid())
  name      String
  status    DeviceStatus @default(AVAILABLE)
  createdAt DateTime @default(now())

  transactions Transaction[]
}

model Transaction {
  id          String @id @default(cuid())
  studentId   String
  deviceId    String
  borrowTime  DateTime
  returnTime  DateTime?
  status      TransactionStatus @default(ACTIVE)
  condition   String?

  student Student @relation(fields: [studentId], references: [id])
  device  Device  @relation(fields: [deviceId], references: [id])

  createdAt DateTime @default(now())
}
```
