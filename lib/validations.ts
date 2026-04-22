import { z } from "zod";

export const studentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  class: z.string().min(1, "Class is required"),
});

export const deviceSchema = z.object({
  name: z.string().min(2, "Device name must be at least 2 characters"),
  status: z.enum(["AVAILABLE", "BORROWED", "MAINTENANCE"]).optional(),
});

export const borrowSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

export const returnSchema = z.object({
  transactionId: z.string().min(1, "Transaction ID is required"),
  condition: z.string().default("Normal"),
});
