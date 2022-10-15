/*
  Warnings:

  - Added the required column `set_date` to the `Set` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "set_date" TIMESTAMP(3) NOT NULL;
