import { trpc } from '@/lib/trpc';

export function useAICalling() {
  const createCampaign = trpc.aiCalling.createCampaign.useMutation();
  const startCampaign = trpc.aiCalling.startCampaign.useMutation();
  const pauseCampaign = trpc.aiCalling.pauseCampaign.useMutation();
  const stopCampaign = trpc.aiCalling.stopCampaign.useMutation();
  const getCampaign = trpc.aiCalling.getCampaign.useQuery;
  const listCampaigns = trpc.aiCalling.listCampaigns.useQuery;
  const getCampaignStats = trpc.aiCalling.getCampaignStats.useQuery;
  const listCalls = trpc.aiCalling.listCalls.useQuery;
  const deleteCampaign = trpc.aiCalling.deleteCampaign.useMutation();

  return {
    createCampaign,
    startCampaign,
    pauseCampaign,
    stopCampaign,
    getCampaign,
    listCampaigns,
    getCampaignStats,
    listCalls,
    deleteCampaign
  };
}
