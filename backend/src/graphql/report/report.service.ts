import { prisma } from "../../lib/prisma.js";

interface CreateReportInput {
  category: String;
  description: String;
  attachmentUrl?: String;
  deviceInfo?: String;
}

export const submitReport = async (userId: string | null, input: any) => {
  try {
    await prisma.report.create({
      data: {
        category: input.category,
        description: input.description,
        attachmentUrl: input.attachmentUrl,
        deviceInfo: input.deviceInfo ? JSON.parse(input.deviceInfo) : undefined,
        userId: userId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error submitting report:", error);
    throw new Error("Failed to submit report");
  }
};
