import type { Role } from '../../types/order';

type AppHeaderProps = {
  selectedRole: Role;
  roles: Role[];
  onRoleChange: (role: Role) => void;
};

const roleLabel = (role: Role) =>
  role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export function AppHeader({ selectedRole, roles, onRoleChange }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">Asset Approval Console</p>
        <h1>Office Asset Orders</h1>
        <p className="subtitle">
          Employees submit orders, finance reviews approvals, and IT admin controls organization access.
        </p>
      </div>
      <label className="role-switch">
        <span>Role</span>
        <select value={selectedRole} onChange={(event) => onRoleChange(event.target.value as Role)}>
          {roles.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
      </label>
    </header>
  );
}
