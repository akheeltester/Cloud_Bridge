import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useActorState } from "@/components/portal/shell";
import { Button } from "@/components/ui/button";
import { Area, Field, SelectField } from "@/components/ui/field";
import { errorText, prettyDate } from "@/lib/jigsaw/format";
import { roleLabel } from "@/lib/jigsaw/permissions";
import { createEmployee, listDepartments, listDirectory } from "@/lib/jigsaw/server";
import type { Actor, Department, Role } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/directory")({ component: Directory });

function Directory() {
  const { actor } = useActorState();
  const [people, setPeople] = useState<Actor[] | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [query, setQuery] = useState("");
  const [departmentId, setDepartmentId] = useState("all");
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);

  function load() {
    return Promise.all([listDirectory(), listDepartments()]).then(([rows, deps]) => {
      setPeople(rows);
      setDepartments(deps);
    });
  }

  useEffect(() => {
    let cancelled = false;
    load().catch((err) => {
      if (!cancelled) setError(errorText(err));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (people ?? []).filter((person) => {
      if (departmentId !== "all" && person.departmentId !== departmentId) return false;
      if (!needle) return true;
      return (
        person.fullName.toLowerCase().includes(needle) ||
        person.title.toLowerCase().includes(needle) ||
        person.email.toLowerCase().includes(needle) ||
        person.location.toLowerCase().includes(needle)
      );
    });
  }, [people, query, departmentId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Directory</h1>
          <p className="mt-2 text-sm text-night-muted">Everyone at Jigsaw, including people who have not signed in yet.</p>
        </div>
        {actor.role === "hr" ? (
          <Button variant="night" onClick={() => setAdding((value) => !value)}>
            {adding ? "Close" : "Add someone"}
          </Button>
        ) : null}
      </div>
      {adding && people ? (
        <AddPerson
          departments={departments}
          people={people}
          onDone={() => {
            setAdding(false);
            load().catch((err) => setError(errorText(err)));
          }}
        />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          night
          label="Search"
          value={query}
          placeholder="Name, title, city"
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectField night label="Department" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </SelectField>
      </div>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      {!people && !error ? <div className="h-40 animate-pulse rounded-lg bg-night-raise" /> : null}
      <ul className="space-y-2 md:hidden">
        {visible.map((person) => (
          <li key={person.id}>
            <PersonLink person={person} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto rounded-lg border border-night-line md:block">
        <table className="w-full text-left text-sm">
          <thead className="text-night-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Started</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((person) => (
              <tr key={person.id} className="border-t border-night-line">
                <td className="px-4 py-3">
                  <Link to="/portal/people/$employeeId" params={{ employeeId: person.id }} className="font-medium">
                    {person.fullName}
                  </Link>
                  <p className="text-xs text-night-muted">{person.title}</p>
                </td>
                <td className="px-4 py-3">{roleLabel(person.role)}</td>
                <td className="px-4 py-3">{person.departmentName}</td>
                <td className="px-4 py-3">{person.location}</td>
                <td className="px-4 py-3 tabular-nums">{prettyDate(person.startDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {people && visible.length === 0 ? <p className="text-sm text-night-muted">No one matches that search.</p> : null}
    </div>
  );
}

function PersonLink({ person }: { person: Actor }) {
  return (
    <Link
      to="/portal/people/$employeeId"
      params={{ employeeId: person.id }}
      className="block rounded-lg border border-night-line bg-night-raise p-4"
    >
      <span className="block font-medium">{person.fullName}</span>
      <span className="mt-1 block text-sm text-night-muted">
        {person.title} · {person.departmentName} · {person.location}
      </span>
    </Link>
  );
}

function AddPerson({
  departments,
  people,
  onDone,
}: {
  departments: Department[];
  people: Actor[];
  onDone: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [managerId, setManagerId] = useState("");
  const [role, setRole] = useState<Role>("employee");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Lisbon");
  const [bio, setBio] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await createEmployee({
        data: { fullName, email, title, departmentId, managerId: managerId || null, role, phone, location, bio, startDate },
      });
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-night-line bg-night-raise p-4 sm:grid-cols-2">
      <Field night label="Name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      <Field night label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Field night label="Title" value={title} onChange={(event) => setTitle(event.target.value)} required />
      <Field night label="Location" value={location} onChange={(event) => setLocation(event.target.value)} required />
      <SelectField night label="Department" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </SelectField>
      <SelectField night label="Manager" value={managerId} onChange={(event) => setManagerId(event.target.value)}>
        <option value="">No manager</option>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.fullName}
          </option>
        ))}
      </SelectField>
      <SelectField night label="Role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
        <option value="hr">People admin</option>
      </SelectField>
      <Field night label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
      <Field night label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <div className="sm:col-span-2">
        <Area night label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>
      {error ? <p className="text-sm text-copper sm:col-span-2">{error}</p> : null}
      <div>
        <Button type="submit" variant="night" disabled={pending}>
          {pending ? "Saving…" : "Save employee"}
        </Button>
      </div>
    </form>
  );
}
