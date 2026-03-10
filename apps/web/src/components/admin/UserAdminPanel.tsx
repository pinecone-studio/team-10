import { type FormEvent, useMemo, useState } from 'react';
import type { CreateUserInput, Role, User } from '../../types/order';

type UserAdminPanelProps = {
  users: User[];
  onCreateUser: (input: CreateUserInput) => Promise<void>;
  onUpdateRole: (userId: string, role: Role) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  currentUserId: string;
};

const roles: Role[] = ['EMPLOYEE', 'INVENTORY_HEAD', 'FINANCE', 'IT_ADMIN', 'HR_MANAGER', 'SYSTEM_ADMIN'];

export function UserAdminPanel({ users, onCreateUser, onUpdateRole, onDeleteUser, currentUserId }: UserAdminPanelProps) {
  const [form, setForm] = useState<CreateUserInput>({ email: '', fullName: '', role: 'EMPLOYEE' });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleDraft, setRoleDraft] = useState<Record<string, Role>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const roleById = useMemo(() => users.reduce<Record<string, Role>>((acc, u) => ({ ...acc, [u.id]: roleDraft[u.id] || u.role }), {}), [users, roleDraft]);
  const filteredUsers = useMemo(() => users.filter((u) => `${u.email} ${u.fullName} ${u.role}`.toLowerCase().includes(search.trim().toLowerCase())), [users, search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      await onCreateUser(form);
      setForm({ email: '', fullName: '', role: 'EMPLOYEE' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const updateRole = async (userId: string) => {
    setError(null);
    setBusyUserId(userId);
    try {
      await onUpdateRole(userId, roleById[userId]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update role');
    } finally {
      setBusyUserId(null);
    }
  };

  const removeUser = async (userId: string) => {
    setError(null);
    setBusyUserId(userId);
    try {
      await onDeleteUser(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user');
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <section className="panel">
      <h2>System Admin: User Provisioning</h2>
      {error ? <p className="inline-error">{error}</p> : null}
      <form className="form-panel" onSubmit={submit}>
        <label>Company Email<input type="email" required disabled={isCreating} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Full Name<input required disabled={isCreating} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        <label>Role<select disabled={isCreating} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
        <button type="submit" disabled={isCreating}>{isCreating ? 'Creating...' : 'Create User'}</button>
      </form>
      <div className="filter-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users: email, name, role" />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>{filteredUsers.map((u) => <tr key={u.id}><td>{u.email}</td><td>{u.fullName}</td><td><select disabled={busyUserId === u.id} value={roleById[u.id]} onChange={(e) => setRoleDraft((p) => ({ ...p, [u.id]: e.target.value as Role }))}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td>{u.id !== currentUserId ? <><button type="button" className="button-muted" disabled={busyUserId === u.id} onClick={() => void updateRole(u.id)}>{busyUserId === u.id ? 'Updating...' : 'Update Role'}</button>{' '}<button type="button" className="danger" disabled={busyUserId === u.id} onClick={() => void removeUser(u.id)}>{busyUserId === u.id ? 'Deleting...' : 'Delete'}</button></> : <span className="row-meta">Current user</span>}</td></tr>)}</tbody>
        </table>
      </div>
      {!filteredUsers.length ? <p className="status-message">No users match search.</p> : null}
    </section>
  );
}
