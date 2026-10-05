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

type Status = "active" | "expired" | "none";

const today = () => new Date().toISOString().slice(0, 10);

function statusOf(m: Member): Status {
  if (!m.membershipEnd) return "none";
  return m.membershipEnd >= today() ? "active" : "expired";
}

const LABEL: Record<Status, string> = {
  active: "Active",
  expired: "Expired",
  none: "No membership",
};

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
          <h2>All members</h2>
          <p>
            {loading ? "Loading members…" : `${filtered.length} of ${members.length} members`}
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
        <div className="msg">No members yet. Add your first member to see them here.</div>
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
                <th>Status</th>
                <th>QR token</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const s = statusOf(m);
                return (
                  <tr key={m.id}>
                    <td>{m.name || "—"}</td>
                    <td>{m.phoneNumber}</td>
                    <td>{m.membershipStart ?? "—"}</td>
                    <td>{m.membershipEnd ?? "—"}</td>
                    <td><span className={`badge ${s}`}>{LABEL[s]}</span></td>
                    <td className="token">{m.qrToken}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>No members match "{query}".</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}