import { useEffect, useState } from 'react';
import './App.css';
import { UserAdminPanel } from './components/admin/UserAdminPanel';
import { CreateOrderForm } from './components/forms/CreateOrderForm';
import { AppHeader } from './components/layout/AppHeader';
import { OrderList } from './components/orders/OrderList';
import { QrLookupPanel } from './components/orders/QrLookupPanel';
import { OrderStats } from './components/orders/OrderStats';
import { NotificationCenter } from './components/ui/NotificationCenter';
import { Toast } from './components/ui/Toast';
import { useNotifications } from './hooks/useNotifications';
import { useOrders } from './hooks/useOrders';
import { useSession } from './hooks/useSession';

function App() {
  const {
    session,
    user,
    role,
    selectedRole,
    roles,
    setSelectedRole,
    requestOptions,
    isLoggedIn,
    isAuthLoading,
    authError,
    createUser,
    updateUserRole,
    deleteUser,
  } =
    useSession();
  const { orders, users, isLoading, isSaving, error, totalSpend, createOrder, reviewOrder, receiveOrderItems, assignOrderItems, reload } = useOrders(
    requestOptions,
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
  const { notifications, unreadCount, isLoading: isNotificationsLoading, readingId, error: notificationError, markRead } =
    useNotifications(requestOptions);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (isAuthLoading && !session) {
    return (
      <div className="shell">
        <AppHeader selectedRole={selectedRole} roles={roles} onRoleChange={setSelectedRole} />
        <section className="panel">
          <p className="status-message">Preparing role workspace...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="shell">
      <AppHeader selectedRole={selectedRole} roles={roles} onRoleChange={setSelectedRole} />
      <div className="session-bar panel">
        <p>
          Role simulation: <strong>{user?.fullName ?? selectedRole}</strong> ({role}) - {user?.email ?? requestOptions.devAuth?.email}
        </p>
        {!isLoggedIn ? <span className="row-meta">Session not ready</span> : null}
      </div>
      {authError ? <p className="error-banner">Auth error: {authError}</p> : null}
      {error && error !== authError ? <p className="error-banner">Error: {error}</p> : null}
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
