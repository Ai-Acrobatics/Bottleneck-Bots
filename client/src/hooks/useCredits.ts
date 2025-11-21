import { trpc } from '@/lib/trpc';

export function useCredits() {
  const getBalance = trpc.credits.getBalance.useQuery;
  const checkBalance = trpc.credits.checkBalance.useQuery;
  const getHistory = trpc.credits.getCreditHistory.useQuery;
  const purchaseCredits = trpc.credits.purchaseCredits.useMutation();
  const listPackages = trpc.credits.listPackages.useQuery;

  return {
    getBalance,
    checkBalance,
    getHistory,
    purchaseCredits,
    listPackages
  };
}
