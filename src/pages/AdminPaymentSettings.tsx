
import React, { useState } from 'react';
import { usePaymentSettings, useUpdatePaymentSettings } from '@/hooks/usePaymentSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Settings, CreditCard, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminPaymentSettings = () => {
  const { data: settings, isLoading, error } = usePaymentSettings();
  const updateSettings = useUpdatePaymentSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    environment: 'sandbox' as 'sandbox' | 'live',
    sandbox_client_id: '',
    sandbox_client_secret: '',
    live_client_id: '',
    live_client_secret: '',
  });

  const [isFormReady, setIsFormReady] = useState(false);

  React.useEffect(() => {
    if (settings && !isFormReady) {
      setFormData({
        environment: settings.environment,
        sandbox_client_id: settings.sandbox_client_id || '',
        sandbox_client_secret: settings.sandbox_client_secret || '',
        live_client_id: settings.live_client_id || '',
        live_client_secret: settings.live_client_secret || '',
      });
      setIsFormReady(true);
    }
  }, [settings, isFormReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings.mutateAsync(formData);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const testConnection = async () => {
    const clientId = formData.environment === 'sandbox' 
      ? formData.sandbox_client_id 
      : formData.live_client_id;
    
    if (!clientId) {
      toast({
        title: 'Error',
        description: 'Please enter a client ID to test the connection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Simple test to verify PayPal SDK can load with the client ID
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
      
      script.onload = () => {
        toast({
          title: 'Connection Test Successful',
          description: 'PayPal SDK loaded successfully with the provided credentials.',
        });
        document.head.removeChild(script);
      };
      
      script.onerror = () => {
        toast({
          title: 'Connection Test Failed',
          description: 'Unable to load PayPal SDK with the provided credentials.',
          variant: 'destructive',
        });
        document.head.removeChild(script);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      toast({
        title: 'Connection Test Failed',
        description: 'Error testing PayPal connection.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load payment settings. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6" />
        <h1 className="text-3xl font-bold">PayPal Payment Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Environment</Label>
                <p className="text-lg font-semibold capitalize">{settings?.environment}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <p className="text-lg font-semibold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle>PayPal API Configuration</CardTitle>
            <CardDescription>
              Configure your PayPal API credentials for payment processing.
              Use sandbox credentials for testing and live credentials for production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Environment Selection */}
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <Select
                  value={formData.environment}
                  onValueChange={(value: 'sandbox' | 'live') => 
                    setFormData({ ...formData, environment: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select environment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                    <SelectItem value="live">Live (Production)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sandbox Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sandbox Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sandbox_client_id">Sandbox Client ID</Label>
                    <Input
                      id="sandbox_client_id"
                      type="text"
                      placeholder="Enter sandbox client ID"
                      value={formData.sandbox_client_id}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        sandbox_client_id: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sandbox_client_secret">Sandbox Client Secret</Label>
                    <Input
                      id="sandbox_client_secret"
                      type="password"
                      placeholder="Enter sandbox client secret"
                      value={formData.sandbox_client_secret}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        sandbox_client_secret: e.target.value 
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Live Credentials */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Live Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="live_client_id">Live Client ID</Label>
                    <Input
                      id="live_client_id"
                      type="text"
                      placeholder="Enter live client ID"
                      value={formData.live_client_id}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        live_client_id: e.target.value 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="live_client_secret">Live Client Secret</Label>
                    <Input
                      id="live_client_secret"
                      type="password"
                      placeholder="Enter live client secret"
                      value={formData.live_client_secret}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        live_client_secret: e.target.value 
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateSettings.isPending}
                >
                  {updateSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                >
                  Test Connection
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help & Documentation */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How to get PayPal API credentials:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Go to <a href="https://developer.paypal.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">PayPal Developer Dashboard</a></li>
                <li>Log in with your PayPal account</li>
                <li>Create a new app or select an existing one</li>
                <li>Copy the Client ID and Client Secret</li>
                <li>Use sandbox credentials for testing, live credentials for production</li>
              </ol>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Keep your API credentials secure and never share them publicly. 
                Always test with sandbox credentials before switching to live mode.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
