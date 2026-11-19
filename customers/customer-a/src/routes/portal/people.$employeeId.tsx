import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useActorState } from "@/components/portal/shell";
import { Button } from "@/components/ui/button";
import { Area, Field, SelectField } from "@/components/ui/field";
import { errorText, prettyDate } from "@/lib/jigsaw/format";
import { editScope, roleLabel } from "@/lib/jigsaw/permissions";
import { getPerson, listDepartments, listDirectory, updateEmployee } from "@/lib/jigsaw/server";
import type { Actor, Department, Role, Status } from "@/lib/jigsaw/types";

export const Route = createFileRoute("/portal/people/$employeeId")({ component: PersonPage });

function PersonPage() {
  const { employeeId } = Route.useParams();
  const { actor, setActor } = useActorState();
  const [person, setPerson] = useState<Actor | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [people, setPeople] = useState<Actor[]>([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPerson(null);
    setEditing(false);
    setError("");
    Promise.all([getPerson({ data: { id: employeeId } }), listDepartments(), listDirectory()])
      .then(([row, deps, directory]) => {
        if (cancelled) return;
        setPerson(row);
        setDepartments(deps);
        setPeople(directory);
      })
      .catch((err) => {
        if (!cancelled) setError(errorText(err));
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const scope = person ? editScope(actor, person) : "none";

  return (
    <div className="space-y-6">
      <Link to="/portal/directory" className="text-sm text-jade-bright">
        Back to directory
      </Link>
      {error ? <p className="text-sm text-copper">{error}</p> : null}
      {!person && !error ? <div className="h-48 animate-pulse rounded-lg bg-night-raise" /> : null}
      {person ? (
        <>
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-full bg-jade text-lg text-paper">
                {person.fullName.slice(0, 1)}
              </span>
              <div>
                <h1 className="font-display text-4xl">{person.fullName}</h1>
                <p className="mt-1 text-sm text-night-muted">
                  {person.title} · {person.departmentName}
                </p>
              </div>
            </div>
            {scope !== "none" ? (
              <Button variant="nightLine" onClick={() => setEditing((value) => !value)}>
                {editing ? "Close" : scope === "personal" ? "Edit your details" : "Edit record"}
              </Button>
            ) : null}
          </header>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Role", roleLabel(person.role)],
              ["Status", person.status],
              ["Email", person.email],
              ["Phone", person.phone || "—"],
              ["Location", person.location],
              ["Manager", person.managerName || "—"],
              ["Started", prettyDate(person.startDate)],
              ["Signed in", person.userId ? "Yes" : "Not yet"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-night-line bg-night-raise px-4 py-3">
                <dt className="text-xs text-night-muted">{label}</dt>
                <dd className="mt-1 text-sm capitalize">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="max-w-2xl text-sm leading-relaxed text-night-muted">{person.bio || "No bio yet."}</p>
          {editing ? (
            <EditForm
              person={person}
              scope={scope}
              departments={departments}
              people={people}
              onSaved={(saved) => {
                setPerson(saved);
                if (saved.id === actor.id) setActor(saved);
                setEditing(false);
              }}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function EditForm({
  person,
  scope,
  departments,
  people,
  onSaved,
}: {
  person: Actor;
  scope: "all" | "team" | "personal" | "none";
  departments: Department[];
  people: Actor[];
  onSaved: (person: Actor) => void;
}) {
  const [fullName, setFullName] = useState(person.fullName);
  const [title, setTitle] = useState(person.title);
  const [departmentId, setDepartmentId] = useState(person.departmentId);
  const [managerId, setManagerId] = useState(person.managerId ?? "");
  const [role, setRole] = useState<Role>(person.role);
  const [phone, setPhone] = useState(person.phone);
  const [location, setLocation] = useState(person.location);
  const [bio, setBio] = useState(person.bio);
  const [status, setStatus] = useState<Status>(person.status);
  const [startDate, setStartDate] = useState(person.startDate.slice(0, 10));
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const locked = scope === "personal";
  const orgLocked = scope !== "all";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const saved = await updateEmployee({
        data: {
          id: person.id,
          fullName,
          title,
          departmentId,
          managerId: managerId || null,
          role,
          phone,
          location,
          bio,
          status,
          startDate,
        },
      });
      onSaved(saved);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-lg border border-night-line p-4 sm:grid-cols-2">
      <Field night label="Name" value={fullName} disabled={orgLocked} onChange={(event) => setFullName(event.target.value)} />
      <Field night label="Title" value={title} disabled={locked} onChange={(event) => setTitle(event.target.value)} />
      <Field night label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
      <Field night label="Location" value={location} onChange={(event) => setLocation(event.target.value)} required />
      <SelectField
        night
        label="Department"
        value={departmentId}
        disabled={orgLocked}
        onChange={(event) => setDepartmentId(event.target.value)}
      >
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </SelectField>
      <SelectField
        night
        label="Manager"
        value={managerId}
        disabled={orgLocked}
        onChange={(event) => setManagerId(event.target.value)}
      >
        <option value="">No manager</option>
        {people
          .filter((row) => row.id !== person.id)
          .map((row) => (
            <option key={row.id} value={row.id}>
              {row.fullName}
            </option>
          ))}
      </SelectField>
      <SelectField night label="Role" value={role} disabled={orgLocked} onChange={(event) => setRole(event.target.value as Role)}>
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
        <option value="hr">People admin</option>
      </SelectField>
      <SelectField night label="Status" value={status} disabled={locked} onChange={(event) => setStatus(event.target.value as Status)}>
        <option value="active">Active</option>
        <option value="leave">Leave</option>
        {scope === "all" ? <option value="inactive">Inactive</option> : null}
      </SelectField>
      <Field
        night
        label="Start date"
        type="date"
        value={startDate}
        disabled={orgLocked}
        onChange={(event) => setStartDate(event.target.value)}
      />
      <div className="sm:col-span-2">
        <Area night label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>
      {scope === "personal" ? (
        <p className="text-xs text-night-muted sm:col-span-2">
          You can change your phone, location, and bio. Title, role, and department stay with your manager or people team.
        </p>
      ) : null}
      {error ? <p className="text-sm text-copper sm:col-span-2">{error}</p> : null}
      <div>
        <Button type="submit" variant="night" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </form>
  );
}
