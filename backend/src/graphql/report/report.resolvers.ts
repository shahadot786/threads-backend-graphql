import * as ReportService from "./report.service.js";

export const reportResolvers = {
  Mutation: {
    submitReport: async (_: any, { input }: { input: any }, context: any) => {
      // User might be null if unauthenticated, which is allowed for reports
      const userId = context.user?.id || null;
      return await ReportService.submitReport(userId, input);
    },
  },
};
