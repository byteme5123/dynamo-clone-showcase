import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePayPalSettings, useUpdatePayPalSettings, useTestPayPalConnection } from '@/hooks/usePayPalSettings';
import { Save, TestTube, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminPayPalSettings = () => {
  const { data: settings, isLoading } = usePayPalSettings();
  const updateMutation = useUpdatePayPalSettings();
  const testConnectionMutation = useTestPayPalConnection();

  const [formData, setFormData] = useState({
    environment: 'sandbox',
    sandbox_client_id: '',
    sandbox_client_secret: '',
    live_client_id: '',
    live_client_secret: '',
    is_active: true,
  });

  const [showCredentials, setShowCredentials] = useState({
    sandbox_client_secret: false,
    live_client_secret: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        environment: settings.environment,
        sandbox_client_id: settings.sandbox_client_id || '',
        sandbox_client_secret: settings.sandbox_client_secret || '',
        live_client_id: settings.live_client_id || '',
        live_client_secret: settings.live_client_secret || '',
        is_active: settings.is_active,
      });
    }
  }, [settings]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      id: settings?.id,
      ...formData,
    });
    setHasChanges(false);
  };

  const handleTestConnection = () => {
    const isLive = formData.environment === 'live';
    const clientId = isLive ? formData.live_client_id : formData.sandbox_client_id;
    const clientSecret = isLive ? formData.live_client_secret : formData.sandbox_client_secret;

    if (!clientId || !clientSecret) {
      return;
    }

    testConnectionMutation.mutate({
      clientId,
      clientSecret,
      environment: formData.environment,
    });
  };

  const maskCredential = (credential: string) => {
    if (!credential) return '';
    return credential.substring(0, 8) + '•'.repeat(Math.max(0, credential.length - 16)) + credential.substring(Math.max(0, credential.length - 8));
  };

  const toggleShowCredential = (field: 'sandbox_client_secret' | 'live_client_secret') => {
    setShowCredentials(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const canTestConnection = () => {
    const isLive = formData.environment === 'live';
    const clientId = isLive ? formData.live_client_id : formData.sandbox_client_id;
    const clientSecret = isLive ? formData.live_client_secret : formData.sandbox_client_secret;
    return !!(clientId && clientSecret);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">PayPal Settings</h1>
          <p className="text-muted-foreground">
            Manage PayPal payment gateway configuration and credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={formData.is_active ? "default" : "secondary"}>
            {formData.is_active ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={formData.environment === 'live' ? "destructive" : "outline"}>
            {formData.environment === 'live' ? "Live" : "Sandbox"}
          </Badge>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          PayPal credentials are stored securely. Use sandbox credentials for testing and live credentials for production.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Enable PayPal</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable PayPal payment processing
              </p>
            </div>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={formData.environment}
              onValueChange={(value) => handleInputChange('environment', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sandbox Credentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use these credentials for testing PayPal integration
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sandbox_client_id">Client ID</Label>
            <Input
              id="sandbox_client_id"
              value={formData.sandbox_client_id}
              onChange={(e) => handleInputChange('sandbox_client_id', e.target.value)}
              placeholder="Your PayPal sandbox client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sandbox_client_secret">Client Secret</Label>
            <div className="relative">
              <Input
                id="sandbox_client_secret"
                type={showCredentials.sandbox_client_secret ? "text" : "password"}
                value={showCredentials.sandbox_client_secret ? formData.sandbox_client_secret : maskCredential(formData.sandbox_client_secret)}
                onChange={(e) => handleInputChange('sandbox_client_secret', e.target.value)}
                placeholder="Your PayPal sandbox client secret"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => toggleShowCredential('sandbox_client_secret')}
              >
                {showCredentials.sandbox_client_secret ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Credentials</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use these credentials for production PayPal processing
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="live_client_id">Client ID</Label>
            <Input
              id="live_client_id"
              value={formData.live_client_id}
              onChange={(e) => handleInputChange('live_client_id', e.target.value)}
              placeholder="Your PayPal live client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="live_client_secret">Client Secret</Label>
            <div className="relative">
              <Input
                id="live_client_secret"
                type={showCredentials.live_client_secret ? "text" : "password"}
                value={showCredentials.live_client_secret ? formData.live_client_secret : maskCredential(formData.live_client_secret)}
                onChange={(e) => handleInputChange('live_client_secret', e.target.value)}
                placeholder="Your PayPal live client secret"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => toggleShowCredential('live_client_secret')}
              >
                {showCredentials.live_client_secret ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={!canTestConnection() || testConnectionMutation.isPending}
        >
          <TestTube className="h-4 w-4 mr-2" />
          {testConnectionMutation.isPending ? 'Testing...' : 'Test Connection'}
        </Button>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {formData.environment === 'live' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> You are using live PayPal credentials. All transactions will be real and will process actual payments.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AdminPayPalSettings;