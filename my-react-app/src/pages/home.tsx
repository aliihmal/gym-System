import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

// Matches the Java Member entity (UUID and LocalDate arrive as strings in JSON)
interface Member {
  id: string;
  name: string;
  phoneNumber: string;
  qrToken: string;
  membershipStart: string | null;
  membershipEnd: string | null;
}

interface DashboardData {
  total: number;
  active: number;
  expired: Member[];
  expiringSoon: Member[];
}

interface MonthStats {
  revenue: number;
  renewals: number;
  newClients: number;
}

// TODO: change if your backend runs elsewhere (or use a Vite proxy and set this to "")
const API_URL = "http://localhost:8080";
// TODO: change the currency symbol to match your gym
const CURRENCY = "$";
const EXPIRING_DAYS = 7;
const LIST_SIZE = 6;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

/** Positive = days left, negative = days overdue. */
function daysLeft(end: string | null): number {
  if (!end) return 0;
  const endDate = new Date(`${end}T00:00:00`);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((endDate.getTime() - startOfToday.getTime()) / MS_PER_DAY);
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

function MemberRow({ m, kind }: { m: Member; kind: "soon" | "expired" }) {
  const d = daysLeft(m.membershipEnd);
  const text =
    kind === "soon"
      ? d === 0 ? "Ends today" : `${plural(d, "day")} left`
      : `${plural(Math.abs(d), "day")} overdue`;
  return (
    <li className="member-row">
      <div>
        <strong>{m.name || "Unnamed member"}</strong>
        <small>{m.phoneNumber}</small>
      </div>
      <span className={`badge ${kind === "soon" ? "soon" : "expired"}`}>{text}</span>
      <Link className="btn ghost small" to={`/members/renew?phone=${encodeURIComponent(m.phoneNumber)}`}>
        Renew
      </Link>
    </li>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<MonthStats | null>(null);
  const [monthError, setMonthError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMonthError(null);

    // Monthly stats load on their own, so a failure here doesn't hide the member data
    const loadMonth = async () => {
      try {
        const [revenue, renewals, newClients] = await Promise.all([
          get<number>("/stat/getMonthlyRev"),
          get<number>("/stat/NbOfRenewl"),
          get<number>("/stat/NbOfNewClient"),
        ]);
        setMonth({ revenue, renewals, newClients });
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Unknown error";
        setMonthError(`Couldn't load this month's numbers. ${reason}.`);
      }
    };

    try {
      const monthDone = loadMonth();
      const [total, active, expired, expiringSoon] = await Promise.all([
        get<number>("/member/MembersNumber"),
        get<number>("/member/ActiveMemberNumber"),
        get<Member[]>("/member/ExpiredMembers"),
        get<Member[]>(`/member/ExpiringSoon?days=${EXPIRING_DAYS}`),
      ]);
      setData({ total, active, expired, expiringSoon });
      await monthDone;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown error";
      setError(`Couldn't load the dashboard. ${reason}. Check that the backend is running and allows requests from this page.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const expiredRecent = useMemo(
    () => [...(data?.expired ?? [])].sort((a, b) => (b.membershipEnd ?? "").localeCompare(a.membershipEnd ?? "")),
    [data]
  );
  const soon = useMemo(
    () => [...(data?.expiringSoon ?? [])].sort((a, b) => (a.membershipEnd ?? "").localeCompare(b.membershipEnd ?? "")),
    [data]
  );

  const show = (n: number | undefined) => (loading || n === undefined ? "–" : n);
  const newOrRenewTotal = month ? month.renewals + month.newClients : 0;
  const renewPct = month && newOrRenewTotal > 0 ? Math.round((month.renewals / newOrRenewTotal) * 100) : 0;
  const activePct = data && data.total > 0 ? Math.round((data.active / data.total) * 100) : 0;

  return (
    <main>
      <div className="dash-head">
        <div>
          <h1>Dashboard</h1>
          <p className="lead" style={{ marginBottom: 0 }}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="row">
          <Link className="btn" to="/users/new">Add member</Link>
          <Link className="btn ghost" to="/users/find">Find member</Link>
          <button className="btn ghost" type="button" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="msg err" role="status">
          {error}{" "}
          <button className="btn ghost" type="button" onClick={load}>Try again</button>
        </div>
      )}

      <section className="stats" aria-label="Summary">
        <Link to="/members" className="stat total">
          <span className="stat-label">Total members</span>
          <span className="stat-value">{show(data?.total)}</span>
        </Link>
        <Link to="/members" className="stat active">
          <span className="stat-label">Active</span>
          <span className="stat-value">{show(data?.active)}</span>
        </Link>
        <div className="stat soon">
          <span className="stat-label">Expiring in {EXPIRING_DAYS} days</span>
          <span className="stat-value">{show(data?.expiringSoon.length)}</span>
        </div>
        <Link to="/members/expired" className="stat expired">
          <span className="stat-label">Expired</span>
          <span className="stat-value">{show(data?.expired.length)}</span>
        </Link>
      </section>

      <section className="card month">
        <h2>This month</h2>
        {monthError && (
          <div className="msg err" role="status">{monthError}</div>
        )}
        {!monthError && (
          <>
            <div className="month-grid">
              <div className="figure revenue">
                <span className="stat-label">Revenue</span>
                <span className="stat-value">
                  {month ? `${CURRENCY}${month.revenue.toLocaleString()}` : "–"}
                </span>
              </div>
              <div className="figure">
                <span className="stat-label">Renewals</span>
                <span className="stat-value">{month ? month.renewals : "–"}</span>
              </div>
              <div className="figure">
                <span className="stat-label">New clients</span>
                <span className="stat-value">{month ? month.newClients : "–"}</span>
              </div>
            </div>

            {month && newOrRenewTotal > 0 && (
              <div className="split">
                <div className="bar" role="img" aria-label={`${renewPct} percent renewals, ${100 - renewPct} percent new clients`}>
                  <div className="bar-fill" style={{ width: `${renewPct}%` }} />
                </div>
                <div className="legend">
                  <span><i className="dot renew" /> Renewals {renewPct}%</span>
                  <span><i className="dot fresh" /> New clients {100 - renewPct}%</span>
                </div>
              </div>
            )}
            {month && newOrRenewTotal === 0 && (
              <div className="empty">No renewals or new clients yet this month.</div>
            )}
          </>
        )}
      </section>

      {data && data.total > 0 && (
        <section className="card health">
          <div className="health-top">
            <strong>{activePct}% of members are active</strong>
            <span>{data.active} of {data.total}</span>
          </div>
          <div className="bar" role="img" aria-label={`${activePct} percent of members are active`}>
            <div className="bar-fill" style={{ width: `${activePct}%` }} />
          </div>
        </section>
      )}

      <div className="dash-grid">
        <section className="card">
          <h2>Expiring this week</h2>
          <p className="card-sub">Contact these members before they lapse.</p>
          {!loading && !error && soon.length === 0 && (
            <div className="empty">No memberships expiring in the next {EXPIRING_DAYS} days.</div>
          )}
          <ul className="member-list">
            {soon.slice(0, LIST_SIZE).map((m) => <MemberRow key={m.id} m={m} kind="soon" />)}
          </ul>
          {soon.length > LIST_SIZE && (
            <p className="card-more">+ {soon.length - LIST_SIZE} more expiring this week</p>
          )}
        </section>

        <section className="card">
          <h2>Needs renewal</h2>
          <p className="card-sub">Most recently expired first.</p>
          {!loading && !error && expiredRecent.length === 0 && (
            <div className="empty">No expired memberships. Everyone is up to date.</div>
          )}
          <ul className="member-list">
            {expiredRecent.slice(0, LIST_SIZE).map((m) => <MemberRow key={m.id} m={m} kind="expired" />)}
          </ul>
          {expiredRecent.length > LIST_SIZE && (
            <p className="card-more">
              <Link to="/members/expired">View all {expiredRecent.length} expired members</Link>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}