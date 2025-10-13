import React from 'react';
import { X } from 'lucide-react';

interface UserDetailsModalProps {
  user: any;
  onClose: () => void;
}

export function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium text-foreground">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Signup Date</p>
                <p className="font-medium text-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email Verification</p>
                <p className={`font-medium ${user.email_verified ? 'text-green-600' : 'text-orange-600'}`}>
                  {user.email_verified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="font-medium text-primary">${user.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Purchased Plans */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Purchased Plans</h3>
            {user.orders.length === 0 ? (
              <p className="text-muted-foreground">No plans purchased yet</p>
            ) : (
              <div className="space-y-3">
                {user.orders.map((order: any) => (
                  <div key={order.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{order.plan_name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Transaction ID: {order.transaction_id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Purchase Date: {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg text-foreground">
                          {order.currency} ${order.amount.toFixed(2)}
                        </p>
                        <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Transaction History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Transaction ID</th>
                    <th className="px-4 py-2 text-left">Plan</th>
                    <th className="px-4 py-2 text-right">Amount</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {user.orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-4 py-2">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {order.transaction_id}
                      </td>
                      <td className="px-4 py-2">{order.plan_name}</td>
                      <td className="px-4 py-2 text-right font-semibold">
                        {order.currency} ${order.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
