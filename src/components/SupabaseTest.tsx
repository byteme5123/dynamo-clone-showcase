
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const SupabaseTest = () => {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing Supabase connection...');
    
    try {
      console.log('🔍 Testing basic Supabase connectivity...');
      
      // Test 1: Simple select
      const { data, error, status: queryStatus } = await supabase
        .from('plans')
        .select('count')
        .limit(1);
      
      console.log('🔍 Test result:', { data, error, queryStatus });
      
      if (error) {
        setStatus('error');
        setMessage(`Connection failed: ${error.message}`);
        return;
      }
      
      setStatus('success');
      setMessage('Supabase connection successful!');
      
    } catch (error: any) {
      console.error('🔍 Connection test error:', error);
      setStatus('error');
      setMessage(`Connection error: ${error.message}`);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-2">Supabase Connection Test</h3>
      <p className={`text-sm mb-2 ${
        status === 'success' ? 'text-green-600' : 
        status === 'error' ? 'text-red-600' : 
        'text-yellow-600'
      }`}>
        {message}
      </p>
      <Button onClick={testConnection} disabled={status === 'testing'}>
        Test Again
      </Button>
    </div>
  );
};

export default SupabaseTest;
