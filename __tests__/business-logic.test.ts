import { checkIfOverdue, canBorrowDevice } from "../lib/business-logic";

describe("Business Logic: Borrowing Rules", () => {
  describe("checkIfOverdue", () => {
    it("should return true if borrowed more than 2 days ago", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      expect(checkIfOverdue(threeDaysAgo, "ACTIVE")).toBe(true);
    });

    it("should return false if borrowed today", () => {
      const now = new Date();
      expect(checkIfOverdue(now, "ACTIVE")).toBe(false);
    });

    it("should return false if status is not ACTIVE even if dates are old", () => {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      
      expect(checkIfOverdue(fiveDaysAgo, "RETURNED")).toBe(false);
    });
  });

  describe("canBorrowDevice", () => {
    it("should allow borrowing if device is AVAILABLE", () => {
      expect(canBorrowDevice("AVAILABLE")).toBe(true);
    });

    it("should not allow borrowing if device is BORROWED", () => {
      expect(canBorrowDevice("BORROWED")).toBe(false);
    });

    it("should not allow borrowing if device is MAINTENANCE", () => {
      expect(canBorrowDevice("MAINTENANCE")).toBe(false);
    });
  });
});
