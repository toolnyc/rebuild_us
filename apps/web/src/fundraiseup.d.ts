declare global {
  var FundraiseUp: {
    openCheckout(campaignId: string, options?: Record<string, unknown>): void;
  };
}
export {};

