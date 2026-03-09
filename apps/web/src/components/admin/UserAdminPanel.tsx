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
  const roleById = useMemo(() => users.reduce<Record<string, Role>>((acc, u) => ({ ...acc, [u.id]: roleDraft[u.id] || u.role }), {}), [users, roleDraft]);
  const filteredUsers = useMemo(() => users.filter((u) => `${u.email} ${u.fullName} ${u.role}`.toLowerCase().includes(search.trim().toLowerCase())), [users, search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try { await onCreateUser(form); setForm({ email: '', fullName: '', role: 'EMPLOYEE' }); } catch (e) { setError(e instanceof Error ? e.message : 'Failed to create user'); }
  };

  const updateRole = async (userId: string) => {
    setError(null);
    try { await onUpdateRole(userId, roleById[userId]); } catch (e) { setError(e instanceof Error ? e.message : 'Failed to update role'); }
  };

  const removeUser = async (userId: string) => {
    setError(null);
    try { await onDeleteUser(userId); } catch (e) { setError(e instanceof Error ? e.message : 'Failed to delete user'); }
  };

  return (
    <section className="panel">
      <h2>System Admin: User Provisioning</h2>
      {error ? <p className="inline-error">{error}</p> : null}
      <form className="form-panel" onSubmit={submit}>
        <label>Company Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Full Name<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
        <label>Role<select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
        <button type="submit">Create User</button>
      </form>
      <div className="filter-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users: email, name, role" />
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Action</th></tr></thead>
          <tbody>{filteredUsers.map((u) => <tr key={u.id}><td>{u.email}</td><td>{u.fullName}</td><td><select value={roleById[u.id]} onChange={(e) => setRoleDraft((p) => ({ ...p, [u.id]: e.target.value as Role }))}>{roles.map((role) => <option key={role} value={role}>{role}</option>)}</select></td><td>{u.id !== currentUserId ? <><button type="button" className="button-muted" onClick={() => void updateRole(u.id)}>Update Role</button>{' '}<button type="button" className="danger" onClick={() => void removeUser(u.id)}>Delete</button></> : <span className="row-meta">Current user</span>}</td></tr>)}</tbody>
        </table>
      </div>
      {!filteredUsers.length ? <p className="status-message">No users match search.</p> : null}
    </section>
  );
}
