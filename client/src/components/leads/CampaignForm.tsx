import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TextareaWithCount } from '@/components/ui/textarea-with-count';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Coins, AlertCircle } from 'lucide-react';
import { useCredits } from '@/hooks/useCredits';

interface LeadList {
  id: string;
  name: string;
  totalLeads: number;
}

interface CampaignFormData {
  name: string;
  description: string;
  leadListId: string;
  callScript: string;
  voiceType: string;
  voiceSpeed: number;
  language: string;
  scheduleType: 'immediate' | 'scheduled';
  scheduledDate?: Date;
}

interface CampaignFormProps {
  leadLists: LeadList[];
  onSubmit: (data: CampaignFormData) => void;
  onCancel?: () => void;
}

export function CampaignForm({ leadLists, onSubmit, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    leadListId: '',
    callScript: '',
    voiceType: 'alloy',
    voiceSpeed: 1.0,
    language: 'en-US',
    scheduleType: 'immediate',
  });

  const { getBalance } = useCredits();
  const { data: balance } = getBalance({ creditType: 'calling' });

  const selectedList = leadLists.find((l) => l.id === formData.leadListId);
  const estimatedCost = selectedList ? selectedList.totalLeads * 2 : 0; // 2 credits per call
  const hasEnoughCredits = balance ? balance.balance >= estimatedCost : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEnoughCredits) return;
    onSubmit(formData);
  };

  const updateField = <K extends keyof CampaignFormData>(
    field: K,
    value: CampaignFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Q4 Outreach Campaign"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <TextareaWithCount
            id="description"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Describe the purpose of this campaign..."
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leadList">Lead List</Label>
          <Select
            value={formData.leadListId}
            onValueChange={(value) => updateField('leadListId', value)}
            required
          >
            <SelectTrigger id="leadList">
              <SelectValue placeholder="Select a lead list" />
            </SelectTrigger>
            <SelectContent>
              {leadLists.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.totalLeads} leads)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="callScript">Call Script</Label>
          <TextareaWithCount
            id="callScript"
            value={formData.callScript}
            onChange={(e) => updateField('callScript', e.target.value)}
            placeholder="Hi {firstName}, I'm calling from {company}..."
            rows={6}
            maxLength={1000}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use variables like {'{firstName}'}, {'{lastName}'}, {'{company}'} to personalize
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="voiceType">Voice Type</Label>
            <Select
              value={formData.voiceType}
              onValueChange={(value) => updateField('voiceType', value)}
            >
              <SelectTrigger id="voiceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                <SelectItem value="echo">Echo (Male)</SelectItem>
                <SelectItem value="fable">Fable (British Male)</SelectItem>
                <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                <SelectItem value="nova">Nova (Female)</SelectItem>
                <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={formData.language}
              onValueChange={(value) => updateField('language', value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="de-DE">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voiceSpeed">Voice Speed: {formData.voiceSpeed}x</Label>
          <input
            id="voiceSpeed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={formData.voiceSpeed}
            onChange={(e) => updateField('voiceSpeed', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Switch
              id="schedule"
              checked={formData.scheduleType === 'scheduled'}
              onCheckedChange={(checked) =>
                updateField('scheduleType', checked ? 'scheduled' : 'immediate')
              }
            />
            <Label htmlFor="schedule">Schedule for later</Label>
          </div>
          {formData.scheduleType === 'scheduled' && (
            <Input
              type="datetime-local"
              value={formData.scheduledDate?.toISOString().slice(0, 16) || ''}
              onChange={(e) =>
                updateField('scheduledDate', new Date(e.target.value))
              }
              className="w-auto"
            />
          )}
        </div>
      </div>

      {selectedList && (
        <div className="p-4 bg-accent rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estimated Cost</span>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold">{estimatedCost} credits</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedList.totalLeads} calls × 2 credits per call
          </p>
        </div>
      )}

      {!hasEnoughCredits && selectedList && (
        <div className="flex items-start gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <div>
            <p className="font-medium">Insufficient Credits</p>
            <p className="text-sm">
              You need {estimatedCost - (balance?.balance || 0)} more credits to run this campaign.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={!hasEnoughCredits || !formData.leadListId}>
          Create Campaign
        </Button>
      </div>
    </form>
  );
}
