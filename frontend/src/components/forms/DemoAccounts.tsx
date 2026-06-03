import React from "react";

interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

interface DemoAccountsProps {
  accounts: DemoAccount[];
  isLoading: boolean;
  onSelect: (account: DemoAccount) => void;
}

export function DemoAccounts({ accounts, isLoading, onSelect }: DemoAccountsProps) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {accounts.map((account) => (
        <button
          key={account.email}
          type="button"
          disabled={isLoading}
          onClick={() => onSelect(account)}
          className="px-4 py-2.5 rounded-xl border border-accent/30 bg-accent/5 text-accent text-sm font-medium hover:bg-accent/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          One-click {account.label}
        </button>
      ))}
    </div>
  );
}
