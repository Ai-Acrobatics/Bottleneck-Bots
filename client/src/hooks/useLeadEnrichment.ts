import { trpc } from '@/lib/trpc';

export function useLeadEnrichment() {
  const uploadList = trpc.leadEnrichment.uploadLeadList.useMutation();
  const processLeads = trpc.leadEnrichment.processLeadList.useMutation();
  const getLists = trpc.leadEnrichment.listLeadLists.useQuery;
  const getList = trpc.leadEnrichment.getLeadList.useQuery;
  const getEnrichedLeads = trpc.leadEnrichment.getEnrichedLeads.useQuery;
  const exportLeads = trpc.leadEnrichment.exportLeads.useMutation();
  const deleteList = trpc.leadEnrichment.deleteLeadList.useMutation();
  const deleteLead = trpc.leadEnrichment.deleteLead.useMutation();
  const reEnrichLeads = trpc.leadEnrichment.reEnrichLeads.useMutation();

  return {
    uploadList,
    processLeads,
    getLists,
    getList,
    getEnrichedLeads,
    exportLeads,
    deleteList,
    deleteLead,
    reEnrichLeads
  };
}
