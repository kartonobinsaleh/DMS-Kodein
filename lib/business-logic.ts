/**
 * Business logic for DMS-Kodein
 */

export const BORROW_LIMIT_DAYS = 2;

/**
 * Checks if a transaction is overdue
 * @param borrowDate The date the device was borrowed
 * @param status The current status of the transaction
 * @returns boolean
 */
export function checkIfOverdue(borrowDate: Date | string, status: string): boolean {
  if (status !== "ACTIVE") return false;

  const borrowTime = new Date(borrowDate).getTime();
  const currentTime = new Date().getTime();
  const diffInDays = (currentTime - borrowTime) / (1000 * 60 * 60 * 24);

  return diffInDays > BORROW_LIMIT_DAYS;
}

/**
 * Validates if a device can be borrowed
 * @param deviceStatus Current status of the device
 */
export function canBorrowDevice(deviceStatus: string): boolean {
  return deviceStatus === "AVAILABLE";
}
