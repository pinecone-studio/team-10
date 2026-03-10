import { useEffect, useState } from 'react';
import { SignIn } from '@clerk/react';
import './App.css';
import { UserAdminPanel } from './components/admin/UserAdminPanel';
import { CreateOrderForm } from './components/forms/CreateOrderForm';
import { AppHeader } from './components/layout/AppHeader';
import { OrderList } from './components/orders/OrderList';
import { QrLookupPanel } from './components/orders/QrLookupPanel';
import { OrderStats } from './components/orders/OrderStats';
import { NotificationCenter } from './components/ui/NotificationCenter';
import { Toast } from './components/ui/Toast';
import { clerkAppearance } from './lib/clerkAppearance';
import { useNotifications } from './hooks/useNotifications';
import { useOrders } from './hooks/useOrders';
import { useSession } from './hooks/useSession';

function App() {
  const { session, token, user, role, isLoggedIn, isAuthLoading, authError, createUser, updateUserRole, deleteUser, logout } =
    useSession();
  const { orders, users, isLoading, isSaving, error, totalSpend, createOrder, reviewOrder, receiveOrderItems, assignOrderItems, reload } = useOrders(
    token,
    role === 'SYSTEM_ADMIN' || role === 'HR_MANAGER',
    role !== 'SYSTEM_ADMIN',
  );
  const [toast, setToast] = useState<string | null>(null);
  const isSystemAdmin = role === 'SYSTEM_ADMIN';
  const canCreateOrder = role === 'INVENTORY_HEAD';
  const canFinanceReview = role === 'FINANCE';
  const canReceive = role === 'IT_ADMIN';
  const canAssign = role === 'HR_MANAGER';
  const qrFromUrl = new URLSearchParams(window.location.search).get('qr')?.trim() || '';
  const ordersForList = canAssign ? orders.filter((order) => order.status === 'IT_RECEIVED') : orders;
  const itemCount = ordersForList.reduce((sum, order) => sum + order.items.length, 0);
  const listTotalSpend = ordersForList.reduce((sum, order) => sum + order.totalCost, 0);
  const { notifications, unreadCount, isLoading: isNotificationsLoading, readingId, error: notificationError, markRead } = useNotifications(token);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!isLoggedIn || !session) {
    return (
      <div className="auth-shell-page">
        <section className="auth-shell panel">
          <aside className="auth-intro">
            <p className="eyebrow">Assets Portal</p>
            <h2>Organization Access</h2>
            <p className="subtitle">Secure sign-in for Inventory, Finance, IT and HR workflow.</p>
            <ul className="auth-points">
              <li>Role-based access control</li>
              <li>Order-to-assignment audit trail</li>
              <li>QR-based asset lookup</li>
            </ul>
          </aside>
          <div className="auth-form">
            {authError ? <p className="inline-error">{authError}</p> : null}
            {isAuthLoading ? <p className="status-message">Checking access...</p> : null}
            {!isAuthLoading ? (
              <div className="clerk-wrap">
                <SignIn routing="hash" appearance={clerkAppearance} />
              </div>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <AppHeader />
      <div className="session-bar panel">
        <p>
          Signed in as <strong>{user?.fullName}</strong> ({user?.role}) - {user?.email}
        </p>
        <button type="button" className="button-muted" onClick={logout}>
          Logout
        </button>
      </div>
      {error ? <p className="error-banner">Error: {error}</p> : null}
      {toast ? <Toast message={toast} /> : null}
      <NotificationCenter
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isNotificationsLoading}
        readingId={readingId}
        error={notificationError}
        onRead={markRead}
      />
      {!isSystemAdmin ? (
        <>
          <OrderStats orderCount={ordersForList.length} itemCount={itemCount} totalSpend={canAssign ? listTotalSpend : totalSpend} />
          <main className={`content-grid ${canCreateOrder ? '' : 'content-grid-single'}`.trim()}>
            {canCreateOrder ? (
              <CreateOrderForm
                isSubmitting={isSaving}
                onSubmit={async (input) => {
                  await createOrder(input);
                  setToast('Order submitted. Finance review pending.');
                }}
              />
            ) : null}
            <section className="panel">
              <h2>Orders</h2>
              <OrderList
                orders={ordersForList}
                users={users}
                isLoading={isLoading}
                canFinanceReview={canFinanceReview}
                canReceive={canReceive}
                canAssign={canAssign}
                isSaving={isSaving}
                onReview={async (orderId, decision, comment) => {
                  await reviewOrder(orderId, decision, comment);
                  setToast(`Order ${decision === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
                }}
                onReceive={async (orderId, items) => {
                  await receiveOrderItems(orderId, items);
                  setToast('Order received and QR generated.');
                }}
                onAssign={async (orderId, items) => {
                  await assignOrderItems(orderId, items);
                  setToast('Asset assigned to employee.');
                }}
              />
            </section>
            <QrLookupPanel orders={orders} initialCode={qrFromUrl} />
          </main>
        </>
      ) : null}
      {isSystemAdmin ? (
        <UserAdminPanel
          users={users}
          onCreateUser={async (input) => {
            await createUser(input);
            setToast('User provisioned successfully.');
            await reload();
          }}
          onDeleteUser={async (userId) => {
            await deleteUser(userId);
            setToast('User deleted successfully.');
            await reload();
          }}
          onUpdateRole={async (userId, nextRole) => {
            await updateUserRole(userId, nextRole);
            setToast('User role updated.');
            await reload();
          }}
          currentUserId={user?.id || ''}
        />
      ) : null}
    </div>
  );
}

export default App;
