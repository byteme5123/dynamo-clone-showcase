import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, RefreshCw, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface EmailLog {
  id: string;
  email_type: string;
  recipient_email: string;
  subject: string;
  status: string;
  error_message: string | null;
  order_id: string | null;
  user_id: string | null;
  created_at: string;
}

const AdminEmailLogs = () => {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();
  const { isAdmin } = useAdminAuth();

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  useEffect(() => {
    fetchEmailLogs();
  }, []);

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchEmail) {
        query = query.ilike('recipient_email', `%${searchEmail}%`);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (filterType !== 'all') {
        query = query.eq('email_type', filterType);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEmailLogs(data || []);
    } catch (error) {
      console.error('Error fetching email logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch email logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmationEmail = async (orderId: string, recipientEmail: string) => {
    try {
      // This would need to be implemented to resend emails
      // For now, just show a placeholder toast
      toast({
        title: "Feature Coming Soon",
        description: "Email resend functionality will be available soon",
        variant: "default",
      });
    } catch (error) {
      console.error('Error resending email:', error);
      toast({
        title: "Error",
        description: "Failed to resend confirmation email",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string, errorMessage: string | null) => {
    if (status === 'sent') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Sent
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" title={errorMessage || 'Failed'}>
          <AlertCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    }
  };

  const getEmailTypeBadge = (type: string) => {
    const typeMap: Record<string, { label: string; color: string }> = {
      'payment_confirmation': { label: 'Payment', color: 'bg-blue-100 text-blue-800' },
      'verification': { label: 'Verification', color: 'bg-purple-100 text-purple-800' },
      'password_reset': { label: 'Password Reset', color: 'bg-orange-100 text-orange-800' },
    };

    const config = typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Email Logs</h1>
            <p className="text-muted-foreground">
              Track and manage all email communications sent from the system
            </p>
          </div>
          <Button onClick={fetchEmailLogs} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emailLogs.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {emailLogs.filter(log => log.status === 'sent').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {emailLogs.filter(log => log.status === 'failed').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter email logs by various criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by recipient email..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment_confirmation">Payment</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="password_reset">Password Reset</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchEmailLogs}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Activity</CardTitle>
            <CardDescription>All email communications sent from the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading email logs...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No email logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {getEmailTypeBadge(log.email_type)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.recipient_email}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={log.subject}>
                          {log.subject}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(log.status, log.error_message)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell>
                          {log.order_id && log.email_type === 'payment_confirmation' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resendConfirmationEmail(log.order_id!, log.recipient_email)}
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              Resend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminEmailLogs;