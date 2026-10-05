import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

// Matches the Java Member entity (UUID and LocalDate arrive as strings in JSON)
interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  qrToken: string;
  membershipStart: string | null;
  membershipEnd: string | null;
}

// Matches the Java MembershipRequest DTO
// TODO: rename phoneNumber if your DTO field is called something else
interface MembershipRequest {
  numberOfMonths: number;
  phoneNumber: string;
}

// TODO: change if your backend runs elsewhere (or use a Vite proxy and set this to "")
const API_URL = "http://localhost:8080";
const QUICK_MONTHS = [1, 3, 6, 12];
const MAX_RESULTS = 6;

const digits = (s: string) => s.replace(/\D/g, "");
const today = () => new Date().toISOString().slice(0, 10);

function statusOf(m: Member): "active" | "expired" | "none" {
  if (!m.membershipEnd) return "none";
  return m.membershipEnd >= today() ? "active" : "expired";
}
const LABEL = { active: "Active", expired: "Expired", none: "No membership" };

type Status = { type: "ok" | "err"; text: string } | null;

export default function RenewMembership() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);
  const [months, setMonths] = useState(1);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const loadMembers = useCallback(async (): Promise<Member[]> => {
    const res = await fetch(`${API_URL}/member/getAll`);
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data: Member[] = await res.json();
    setMembers(data);
    return data;
  }, []);

  const initialLoad = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      await loadMembers();
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      setLoadError(`Couldn't load members. ${reason}. Check that the backend is running.`);
    } finally {
      setLoading(false);
    }
  }, [loadMembers]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  // Match by phone number (digits only, so "+961 70-123" finds "96170123") or by name
  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const qDigits = digits(q);
    const qText = q.toLowerCase();
    return members.filter((m) =>
      qDigits
        ? digits(m.phoneNumber ?? "").includes(qDigits)
        : m.name?.toLowerCase().includes(qText)
    );
  }, [members, query]);

  const choose = (m: Member) => {
    setSelected(m);
    setMonths(1);
    setStatus(null);
  };

  const onSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (matches.length === 1) choose(matches[0]);
  };

  const reset = () => {
    setSelected(null);
    setQuery("");
    setStatus(null);
  };

  const onRenew = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const body: MembershipRequest = { numberOfMonths: months, phoneNumber: selected.phoneNumber };
    setSaving(true);
    setStatus(null);
    try {
      // TODO: change the method if your controller uses PUT or PATCH
      const res = await fetch(`${API_URL}/member/renewMembership/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || `Server returned ${res.status}`);
      }
      // Refresh so the card shows the new end date
      const fresh = await loadMembers();
      setSelected(fresh.find((m) => m.id === selected.id) ?? selected);
      setStatus({
        type: "ok",
        text: `Renewed ${selected.name || "member"} for ${months} ${months === 1 ? "month" : "months"}.`,
      });
      setMonths(1);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      setStatus({ type: "err", text: `Couldn't renew the membership. ${reason}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="panel">
      <h2>Renew a membership</h2>
      <p>Search by phone number, then choose how many months to add.</p>

      {loading && <div className="msg">Loading members…</div>}

      {loadError && (
        <div className="msg err" role="status">
          {loadError}{" "}
          <button className="btn ghost" type="button" onClick={initialLoad}>Try again</button>
        </div>
      )}

      {!loading && !loadError && !selected && (
        <>
          <form className="search" onSubmit={onSearchSubmit}>
            <label>
              Phone number
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a phone number or name"
                autoFocus
                autoComplete="off"
              />
            </label>
          </form>

          {query.trim() && matches.length === 0 && (
            <div className="msg">No member matches "{query}". Check the number and try again.</div>
          )}

          {matches.length > 0 && (
            <ul className="results">
              {matches.slice(0, MAX_RESULTS).map((m) => {
                const s = statusOf(m);
                return (
                  <li key={m.id}>
                    <button type="button" className="result" onClick={() => choose(m)}>
                      <span>
                        <strong>{m.name || "Unnamed member"}</strong>
                        <small>{m.phoneNumber}</small>
                      </span>
                      <span className={`badge ${s}`}>{LABEL[s]}</span>
                    </button>
                  </li>
                );
              })}
              {matches.length > MAX_RESULTS && (
                <li className="more">{matches.length - MAX_RESULTS} more. Type more digits to narrow it down.</li>
              )}
            </ul>
          )}
        </>
      )}

      {selected && (
        <>
          <div className="member-card">
            <div>
              <h3>{selected.name || "Unnamed member"}</h3>
              <small>{selected.phoneNumber}</small>
            </div>
            <dl>
              <dt>Status</dt>
              <dd><span className={`badge ${statusOf(selected)}`}>{LABEL[statusOf(selected)]}</span></dd>
              <dt>Membership ends</dt>
              <dd>{selected.membershipEnd ?? "Not set"}</dd>
            </dl>
            <button type="button" className="btn ghost" onClick={reset}>Change member</button>
          </div>

          <form onSubmit={onRenew} style={{ marginTop: "1.5rem" }}>
            <label>
              Number of months *
              <input
                type="number"
                min={1}
                max={60}
                step={1}
                value={months}
                onChange={(e) => setMonths(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
                required
              />
            </label>

            <div className="quick full">
              {QUICK_MONTHS.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip ${months === m ? "on" : ""}`}
                  onClick={() => setMonths(m)}
                >
                  {m} {m === 1 ? "month" : "months"}
                </button>
              ))}
            </div>

            <div className="full row">
              <button className="btn" type="submit" disabled={saving}>Renew membership</button>
            </div>
          </form>
        </>
      )}

      {status && <div className={`msg ${status.type}`} role="status">{status.text}</div>}
    </main>
  );
}