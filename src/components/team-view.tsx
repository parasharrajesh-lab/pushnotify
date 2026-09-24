import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RIGHT_ROWS, RIGHTS, ROLE_LABEL, ROLES, type Role } from "@/lib/account-types";
import { usePush } from "@/lib/push-store";
import { cn } from "@/lib/utils";

export function TeamView() {
  const members = usePush((s) => s.members);
  const invite = usePush((s) => s.invite);
  const changeRole = usePush((s) => s.changeRole);
  const removeTeammate = usePush((s) => s.removeTeammate);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("marketer");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Team</h1>
        <p className="pt-1 text-sm text-muted-foreground">
          Invite by email. They join with that address when they register or sign in. You choose the role.
        </p>
      </div>

      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            const error = await invite({ email, role });
            if (error) toast.error(error);
            else {
              toast.success("Team seat saved.");
              setEmail("");
            }
          })();
        }}
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ops@company.com" required />
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={role === item}
              onClick={() => setRole(item)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", role === item ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {ROLE_LABEL[item]}
            </button>
          ))}
        </div>
        <Button type="submit">Add to team</Button>
      </form>

      <ul className="flex flex-col gap-2">
        {members.map((member) => (
          <li key={member.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              <p className="text-xs font-medium text-muted-foreground">{member.pending ? "Waiting to register" : "Active"}</p>
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              {ROLES.map((item) => (
                <button
                  key={item}
                  type="button"
                  disabled={member.pending}
                  aria-pressed={member.role === item}
                  onClick={() => {
                    void (async () => {
                      const error = await changeRole({ id: member.id, role: item });
                      if (error) toast.error(error);
                    })();
                  }}
                  className={cn(
                    "h-10 rounded-sm px-3 text-xs font-medium disabled:opacity-40",
                    member.role === item ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {ROLE_LABEL[item]}
                </button>
              ))}
              <button
                type="button"
                className="h-10 rounded-sm px-3 text-xs font-medium text-danger hover:bg-danger-bg"
                onClick={() => {
                  void (async () => {
                    const error = await removeTeammate(member.id);
                    if (error) toast.error(error);
                  })();
                }}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <section className="overflow-x-auto rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Rights</h2>
        <table className="mt-3 w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th className="py-2 font-medium">Function</th>
              {ROLES.map((item) => (
                <th key={item} className="py-2 font-medium">
                  {ROLE_LABEL[item]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RIGHT_ROWS.map((row) => (
              <tr key={row.id} className="border-t border-border">
                <td className="py-2 pr-3">{row.label}</td>
                {ROLES.map((item) => (
                  <td key={item} className="py-2 text-muted-foreground">
                    {RIGHTS[item].includes(row.id) ? "Yes" : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
