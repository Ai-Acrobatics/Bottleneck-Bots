import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Database,
  Download,
  Copy,
  FileJson,
  Table as TableIcon,
  ExternalLink,
  Calendar,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface SessionDataViewerProps {
  sessionId: string;
  className?: string;
}

export function SessionDataViewer({ sessionId, className = '' }: SessionDataViewerProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Fetch extracted data for this session
  const { data: extractedDataList, isLoading } = trpc.browser.listSessions.useQuery(
    { status: undefined, limit: 100, offset: 0 },
    {
      enabled: Boolean(sessionId),
      select: (data) => {
        // Filter to only this session and get extracted data
        const session = data?.find((s: any) => s.sessionId === sessionId) as any;
        return session?.extractedData || [];
      },
    }
  );

  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadData = (data: any, filename: string, format: 'json' | 'csv') => {
    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename = `${filename}.json`;
    } else {
      // Convert to CSV (basic implementation)
      const flatData = Array.isArray(data) ? data : [data];
      const headers = Object.keys(flatData[0] || {});
      const rows = flatData.map((item) =>
        headers.map((h) => JSON.stringify(item[h] || '')).join(',')
      );
      content = [headers.join(','), ...rows].join('\n');
      mimeType = 'text/csv';
      filename = `${filename}.csv`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Data downloaded as ${format.toUpperCase()}`);
  };

  const copyData = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    toast.success('Data copied to clipboard');
  };

  const groupedData = extractedDataList?.reduce((acc: any, item: any) => {
    const type = item.dataType || 'custom';
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {}) || {};

  const allDataTypes = Object.keys(groupedData);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Extracted Data
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadData(extractedDataList, `session-${sessionId}-data`, 'json')}
              className="gap-1"
              disabled={!extractedDataList || extractedDataList.length === 0}
            >
              <Download className="h-3 w-3" />
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadData(extractedDataList, `session-${sessionId}-data`, 'csv')}
              className="gap-1"
              disabled={!extractedDataList || extractedDataList.length === 0}
            >
              <Download className="h-3 w-3" />
              CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">
            <Database className="h-8 w-8 mx-auto mb-2 animate-pulse" />
            <p>Loading extracted data...</p>
          </div>
        ) : !extractedDataList || extractedDataList.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No data extracted yet</p>
            <p className="text-sm mt-1">
              Data extracted from this session will appear here
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({extractedDataList.length})
              </TabsTrigger>
              {allDataTypes.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)} ({groupedData[type].length})
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[500px]">
              <TabsContent value="all" className="space-y-3 mt-0">
                {extractedDataList.map((item: any, index: number) => (
                  <DataItemCard
                    key={item.id || index}
                    item={item}
                    onCopy={() => copyData(item.data)}
                    onDownload={(format) =>
                      downloadData(item.data, `extracted-${item.id}`, format)
                    }
                  />
                ))}
              </TabsContent>

              {allDataTypes.map((type) => (
                <TabsContent key={type} value={type} className="space-y-3 mt-0">
                  {groupedData[type].map((item: any, index: number) => (
                    <DataItemCard
                      key={item.id || index}
                      item={item}
                      onCopy={() => copyData(item.data)}
                      onDownload={(format) =>
                        downloadData(item.data, `extracted-${item.id}`, format)
                      }
                    />
                  ))}
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

interface DataItemCardProps {
  item: any;
  onCopy: () => void;
  onDownload: (format: 'json' | 'csv') => void;
}

function DataItemCard({ item, onCopy, onDownload }: DataItemCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'table':
      case 'tableData':
        return TableIcon;
      case 'contactInfo':
      case 'productInfo':
        return Database;
      default:
        return FileJson;
    }
  };

  const Icon = getDataTypeIcon(item.dataType);

  return (
    <Card className="border border-slate-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-blue-100 p-2 rounded">
              <Icon className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs">
                  {item.dataType || 'custom'}
                </Badge>
                {item.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="text-xs gap-1">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
              {item.url && (
                <div className="flex items-center gap-1 text-xs text-slate-600 mb-2">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate"
                  >
                    {item.url}
                  </a>
                </div>
              )}
              {item.selector && (
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {item.selector}
                </code>
              )}
              {item.metadata?.instruction && (
                <p className="text-sm text-slate-600 mt-2">
                  {item.metadata.instruction}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onCopy} className="h-8 w-8 p-0">
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDownload('json')}
              className="h-8 w-8 p-0"
            >
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Calendar className="h-3 w-3" />
          {new Date(item.createdAt).toLocaleString()}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full text-xs"
        >
          {expanded ? 'Hide Data' : 'Show Data'}
        </Button>

        {expanded && (
          <div className="mt-3">
            <ScrollArea className="h-[200px] rounded border bg-slate-950 p-3">
              <pre className="text-xs text-slate-100 font-mono">
                {JSON.stringify(item.data, null, 2)}
              </pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
