import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Spinner } from './ui/spinner';
import { SessionReplayPlayer } from './SessionReplayPlayer';
import { Globe, Zap, Eye, Play, Code, Database, RefreshCw } from 'lucide-react';
import { useAIChat, useObservePage, useExtractData, useSessionReplay, useListSessions } from '@/hooks/useAI';

interface AIBrowserPanelProps {
  onLog?: (message: string) => void;
}

export const AIBrowserPanel: React.FC<AIBrowserPanelProps> = ({ onLog }) => {
  // Initialize tRPC hooks
  const chatHook = useAIChat();
  const observeHook = useObservePage();
  const extractHook = useExtractData();
  const sessionsQuery = useListSessions();

  const [activeTab, setActiveTab] = useState<'execute' | 'observe' | 'extract' | 'sessions'>('execute');
  const [result, setResult] = useState<any>(null);

  // Execute form state
  const [executeUrl, setExecuteUrl] = useState('https://google.com');
  const [executeInstruction, setExecuteInstruction] = useState('');
  const [geoCity, setGeoCity] = useState('');
  const [geoState, setGeoState] = useState('');
  const [geoCountry, setGeoCountry] = useState('US');

  // Observe form state
  const [observeUrl, setObserveUrl] = useState('');
  const [observeInstruction, setObserveInstruction] = useState('');

  // Extract form state
  const [extractUrl, setExtractUrl] = useState('');
  const [extractInstruction, setExtractInstruction] = useState('');
  const [extractType, setExtractType] = useState<'contactInfo' | 'productInfo' | 'custom'>('contactInfo');

  // Session replay state
  const [sessionId, setSessionId] = useState('');
  const replayQuery = useSessionReplay(sessionId);

  // Computed loading state from all hooks
  const isLoading = chatHook.isLoading || observeHook.isLoading || extractHook.isLoading || replayQuery.isLoading || sessionsQuery.isLoading;

  const handleExecuteAction = async () => {
    onLog?.(`Executing: ${executeInstruction}`);

    try {
      const result = await chatHook.execute({
        instruction: executeInstruction,
        startUrl: executeUrl,
        geolocation: geoCity ? { city: geoCity, state: geoState, country: geoCountry } : undefined,
      });

      setResult(result);
      onLog?.(`✓ Success! Session: ${result.sessionId}`);
    } catch (error) {
      onLog?.(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult({ success: false, error: String(error) });
    }
  };

  const handleObservePage = async () => {
    onLog?.(`Observing page: ${observeUrl}`);

    try {
      const result = await observeHook.observe({
        url: observeUrl,
        instruction: observeInstruction,
      });

      setResult(result);
      onLog?.(`✓ Found ${result.actions?.length || 0} actions`);
    } catch (error) {
      onLog?.(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult({ success: false, error: String(error) });
    }
  };

  const handleExtractData = async () => {
    onLog?.(`Extracting ${extractType} from: ${extractUrl}`);

    try {
      const result = await extractHook.extract({
        url: extractUrl,
        instruction: extractInstruction,
        schemaType: extractType,
      });

      setResult(result);
      onLog?.(`✓ Extracted data successfully`);
    } catch (error) {
      onLog?.(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult({ success: false, error: String(error) });
    }
  };

  const handleLoadReplay = async () => {
    if (!sessionId) return;

    onLog?.(`Loading replay for session: ${sessionId}`);

    try {
      await replayQuery.refetch();
      onLog?.(`✓ Replay loaded`);
    } catch (error) {
      onLog?.(`✗ Error loading replay: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLoadSessions = async () => {
    onLog?.('Loading active sessions...');

    try {
      await sessionsQuery.refetch();
      onLog?.(`✓ Found ${sessionsQuery.sessions.length} sessions`);
    } catch (error) {
      onLog?.(`✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="h-full space-y-2 sm:space-y-4 p-2 sm:p-0">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
            AI Browser Automation
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Execute browser actions, observe pages, extract data, and view session replays
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            {/* Mobile: 2x2 Grid, Desktop: 1x4 Grid */}
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
              <TabsTrigger value="execute" className="text-xs sm:text-sm p-2 sm:p-3">
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Execute</span>
              </TabsTrigger>
              <TabsTrigger value="observe" className="text-xs sm:text-sm p-2 sm:p-3">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Observe</span>
              </TabsTrigger>
              <TabsTrigger value="extract" className="text-xs sm:text-sm p-2 sm:p-3">
                <Database className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Extract</span>
              </TabsTrigger>
              <TabsTrigger value="sessions" className="text-xs sm:text-sm p-2 sm:p-3">
                <Play className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="execute" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="execute-url">Start URL</Label>
                  <Input
                    id="execute-url"
                    value={executeUrl}
                    onChange={(e) => setExecuteUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="execute-instruction">Instruction</Label>
                  <Textarea
                    id="execute-instruction"
                    value={executeInstruction}
                    onChange={(e) => setExecuteInstruction(e.target.value)}
                    placeholder="Search for React tutorials and click the first result"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="geo-city" className="text-xs sm:text-sm">City (Optional)</Label>
                    <Input
                      id="geo-city"
                      value={geoCity}
                      onChange={(e) => setGeoCity(e.target.value)}
                      placeholder="NEW_YORK"
                      className="text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geo-state" className="text-xs sm:text-sm">State</Label>
                    <Input
                      id="geo-state"
                      value={geoState}
                      onChange={(e) => setGeoState(e.target.value)}
                      placeholder="NY"
                      className="text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="geo-country" className="text-xs sm:text-sm">Country</Label>
                    <Input
                      id="geo-country"
                      value={geoCountry}
                      onChange={(e) => setGeoCountry(e.target.value)}
                      placeholder="US"
                      className="text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleExecuteAction}
                  disabled={isLoading || !executeInstruction}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Execute Action
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="observe" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="observe-url">Page URL</Label>
                  <Input
                    id="observe-url"
                    value={observeUrl}
                    onChange={(e) => setObserveUrl(e.target.value)}
                    placeholder="https://example.com/form"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observe-instruction">What to observe</Label>
                  <Textarea
                    id="observe-instruction"
                    value={observeInstruction}
                    onChange={(e) => setObserveInstruction(e.target.value)}
                    placeholder="fill out all fields on the page with dummy data"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleObservePage}
                  disabled={isLoading || !observeUrl || !observeInstruction}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Observing...
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Observe Page
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="extract" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="extract-url">Page URL</Label>
                  <Input
                    id="extract-url"
                    value={extractUrl}
                    onChange={(e) => setExtractUrl(e.target.value)}
                    placeholder="https://example.com/contact"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extract-type">Data Type</Label>
                  <Select value={extractType} onValueChange={(v: any) => setExtractType(v)}>
                    <SelectTrigger id="extract-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contactInfo">Contact Information</SelectItem>
                      <SelectItem value="productInfo">Product Information</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extract-instruction">Extraction Instruction</Label>
                  <Textarea
                    id="extract-instruction"
                    value={extractInstruction}
                    onChange={(e) => setExtractInstruction(e.target.value)}
                    placeholder="get the contact information of the company"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleExtractData}
                  disabled={isLoading || !extractUrl || !extractInstruction}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Extract Data
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="session_123456"
                    className="flex-1"
                  />
                  <Button onClick={handleLoadReplay} disabled={isLoading || !sessionId}>
                    {isLoading ? <Spinner className="h-4 w-4" /> : 'Load'}
                  </Button>
                </div>

                <Button
                  onClick={handleLoadSessions}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Active Sessions
                </Button>

                {sessionsQuery.sessions.length > 0 && (
                  <div className="space-y-2">
                    <Label>Active Sessions</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {sessionsQuery.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-accent"
                          onClick={() => setSessionId(session.id)}
                        >
                          <div className="flex items-center justify-between">
                            <code className="text-xs">{session.id}</code>
                            <Badge variant={session.status === 'running' ? 'default' : 'secondary'}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {replayQuery.replay && (
                  <div className="w-full overflow-hidden">
                    <SessionReplayPlayer
                      sessionId={replayQuery.replay.sessionId}
                      events={replayQuery.replay.events}
                      width={window.innerWidth < 640 ? window.innerWidth - 64 : 800}
                      height={window.innerWidth < 640 ? 300 : 450}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Result Display */}
          {result && (
            <Card className="mt-2 sm:mt-4">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm flex items-center gap-2">
                  <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                  Result
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <pre className="text-[10px] sm:text-xs bg-muted p-2 sm:p-4 rounded-lg overflow-auto max-h-40 sm:max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
