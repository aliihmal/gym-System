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

// TODO: change if your backend runs elsewhere (or use a Vite proxy and set this to "")
const API_URL = "http://localhost:8080";
const MAX_RESULTS = 8;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const digits = (s: string) => s.replace(/\D/g, "");
const today = () => new Date().toISOString().slice(0, 10);

type Status = "active" | "expired" | "none";
const LABEL: Record<Status, string> = { active: "Active", expired: "Expired", none: "No membership" };

function statusOf(m: Member): Status {
  if (!m.membershipEnd) return "none";
  return m.membershipEnd >= today() ? "active" : "expired";
}

/** Positive = days left, negative = days overdue. */
function daysLeft(end: string | null): number | null {
  if (!end) return null;
  const endDate = new Date(`${end}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((endDate.getTime() - startOfToday.getTime()) / MS_PER_DAY);
}

function remainingText(end: string | null): string {
  const d = daysLeft(end);
  if (d === null) return "Not set";
  if (d === 0) return "Ends today";
  const n = Math.abs(d);
  const unit = n === 1 ? "day" : "days";
  return d > 0 ? `${n} ${unit} left` : `Expired ${n} ${unit} ago`;
}

export default function GetUser() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Member | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/member/getAll`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: Member[] = await res.json();
      setMembers(data);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      setError(`Couldn't load members. ${reason}. Check that the backend is running and allows requests from this page.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Phone numbers match on digits only ("+961 70-123" finds "96170123"); anything with letters matches names
  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    const qDigits = digits(q);
    const qText = q.toLowerCase();
    const looksLikePhone = qDigits.length > 0 && /^[\d\s+()-]+$/.test(q);
    return members.filter((m) =>
      looksLikePhone
        ? digits(m.phoneNumber ?? "").includes(qDigits)
        : m.name?.toLowerCase().includes(qText)
    );
  }, [members, query]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (matches.length === 1) setSelected(matches[0]);
  };

  const back = () => {
    setSelected(null);
    setQuery("");
  };

  return (
    <main className="panel">
      <h2>Find a member</h2>
      <p>Search by name or phone number.</p>

      {loading && <div className="msg">Loading members…</div>}

      {error && (
        <div className="msg err" role="status">
          {error}{" "}
          <button className="btn ghost" type="button" onClick={load}>Try again</button>
        </div>
      )}

      {!loading && !error && !selected && (
        <>
          <form className="search" onSubmit={onSubmit}>
            <label>
              Name or phone number
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Sara or 70123456"
                autoFocus
                autoComplete="off"
              />
            </label>
          </form>

          {query.trim() && matches.length === 0 && (
            <div className="msg">No member matches "{query}". Check the spelling or number and try again.</div>
          )}

          {matches.length > 0 && (
            <ul className="results">
              {matches.slice(0, MAX_RESULTS).map((m) => {
                const s = statusOf(m);
                return (
                  <li key={m.id}>
                    <button type="button" className="result" onClick={() => setSelected(m)}>
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
                <li className="more">{matches.length - MAX_RESULTS} more. Type more to narrow it down.</li>
              )}
            </ul>
          )}
        </>
      )}

      {selected && (
        <section className="profile">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h2>{selected.name || "Unnamed member"}</h2>
            <span className={`badge ${statusOf(selected)}`}>{LABEL[statusOf(selected)]}</span>
          </div>
          <dl>
            <dt>Phone number</dt><dd>{selected.phoneNumber}</dd>
            <dt>Membership start</dt><dd>{selected.membershipStart ?? "Not set"}</dd>
            <dt>Membership end</dt><dd>{selected.membershipEnd ?? "Not set"}</dd>
            <dt>Time remaining</dt><dd>{remainingText(selected.membershipEnd)}</dd>
            <dt>QR token</dt><dd className="token">{selected.qrToken}</dd>
          </dl>
          <div className="row" style={{ marginTop: "1.25rem" }}>
            <button className="btn ghost" type="button" onClick={back}>Search again</button>
          </div>
        </section>
      )}
    </main>
  );
}