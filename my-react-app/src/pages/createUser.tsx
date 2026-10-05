import { useState, type ChangeEvent, type FormEvent } from "react";

type CreateMemberInput = {
  name: string;
  phoneNumber: string;
  qrToken: string;
};

type Status = {
  type: "ok" | "err";
  text: string;
} | null;

const emptyForm = (): CreateMemberInput => ({
  name: "",
  phoneNumber: "",
  qrToken: "",
});

export default function CreateUser() {
  const [form, setForm] = useState<CreateMemberInput>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const createMember = async (member: CreateMemberInput) => {
    const response = await fetch("http://localhost:8080/member/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(member),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Server returned ${response.status}`);
    }

    return response.json();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setStatus(null);

    try {
      // Generate a unique QR token
      const qrToken = crypto.randomUUID();

      const member = {
        name: form.name,
        phoneNumber: form.phoneNumber,
        qrToken,
      };

      const result = await createMember(member);

      setStatus({
        type: "ok",
        text: `Member added successfully. ${
          result.id ? `Member ID: ${result.id}` : ""
        }`,
      });

      setForm(emptyForm());
    } catch (err) {
      const reason =
        err instanceof Error ? err.message : "Unknown error";

      setStatus({
        type: "err",
        text: `Couldn't add the member. ${reason}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="panel">
      <h2>Add a member</h2>

      <p>
        Enter the member's information below.
      </p>

      <form onSubmit={onSubmit}>
        <label>
          Full name *
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            autoComplete="name"
            placeholder="Ali Hamza"
          />
        </label>

        <label>
          Phone number *
          <input
            name="phoneNumber"
            type="tel"
            value={form.phoneNumber}
            onChange={onChange}
            required
            autoComplete="tel"
            placeholder="+961 71 123 456"
          />
        </label>

        <div className="full row">
          <button
            className="btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add member"}
          </button>

          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              setForm(emptyForm());
              setStatus(null);
            }}
          >
            Clear form
          </button>
        </div>
      </form>

      {status && (
        <div className={`msg ${status.type}`} role="status">
          {status.text}
        </div>
      )}
    </main>
  );
}
