
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserTransactions } from '@/hooks/useTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, User, CreditCard, Calendar } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import NotificationBar from '@/components/NotificationBar';
import Navbar from '@/components/Navbar';
import FigmaFooter from '@/components/FigmaFooter';
import { format } from 'date-fns';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { data: transactions, isLoading: transactionsLoading } = useUserTransactions(user?.id);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const completedTransactions = transactions?.filter(t => t.status === 'completed') || [];
  const totalSpent = completedTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      <NotificationBar />
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user.first_name}!</h1>
            <p className="text-muted-foreground">Manage your plans and view your transaction history</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Active purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                All time purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format(new Date(user.created_at), 'MMM yyyy')}
              </div>
              <p className="text-xs text-muted-foreground">
                Account created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your plan purchases and transaction details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading transactions...</span>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">
                          {transaction.plan?.name || 'Plan Purchase'}
                        </p>
                        <Badge 
                          variant={
                            transaction.status === 'completed' ? 'default' :
                            transaction.status === 'pending' ? 'secondary' :
                            transaction.status === 'failed' ? 'destructive' : 'outline'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.created_at), 'PPP p')}
                      </p>
                      {transaction.paypal_transaction_id && (
                        <p className="text-xs text-muted-foreground">
                          Transaction ID: {transaction.paypal_transaction_id}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${Number(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {transaction.payment_method}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
                <Link to="/plans">
                  <Button className="mt-4">
                    Browse Plans
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/plans">
            <Button size="lg" className="mr-4">
              Browse Plans
            </Button>
          </Link>
          <Button variant="outline" size="lg">
            Contact Support
          </Button>
        </div>
      </div>
      
      <FigmaFooter />
    </div>
  );
};

export default Dashboard;
