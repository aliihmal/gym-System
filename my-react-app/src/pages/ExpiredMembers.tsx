import { useCallback, useEffect, useMemo, useState } from "react";

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

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysOverdue(end: string | null): number | null {
  if (!end) return null;
  const endDate = new Date(`${end}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(0, Math.round((startOfToday.getTime() - endDate.getTime()) / MS_PER_DAY));
}

export default function ExpiredMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/member/ExpiredMembers`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: Member[] = await res.json();
      // Longest overdue first
      data.sort((a, b) => (a.membershipEnd ?? "").localeCompare(b.membershipEnd ?? ""));
      setMembers(data);
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      setError(`Couldn't load expired members. ${reason}. Check that the backend is running and allows requests from this page.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.phoneNumber?.toLowerCase().includes(q)
    );
  }, [members, query]);

  return (
    <main className="panel wide">
      <div className="list-head">
        <div>
          <h2>Expired memberships</h2>
          <p>
            {loading
              ? "Loading members…"
              : `${filtered.length} of ${members.length} members past their end date`}
          </p>
        </div>
        <label>
          Search
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or phone number"
          />
        </label>
      </div>

      {error && (
        <div className="msg err" role="status">
          {error}{" "}
          <button className="btn ghost" type="button" onClick={load}>
            Try again
          </button>
        </div>
      )}

      {!error && !loading && members.length === 0 && (
        <div className="msg ok">No expired memberships. Everyone is up to date.</div>
      )}

      {!error && members.length > 0 && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Membership start</th>
                <th>Membership end</th>
                <th>Overdue</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const days = daysOverdue(m.membershipEnd);
                return (
                  <tr key={m.id}>
                    <td>{m.name || "—"}</td>
                    <td>{m.phoneNumber}</td>
                    <td>{m.membershipStart ?? "—"}</td>
                    <td>{m.membershipEnd ?? "—"}</td>
                    <td>
                      {days === null ? (
                        "—"
                      ) : (
                        <span className="badge expired">
                          {days} {days === 1 ? "day" : "days"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5}>No members match "{query}".</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}