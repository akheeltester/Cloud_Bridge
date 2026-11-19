import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import type {
  Actor,
  AuditRow,
  ContactNote,
  Dashboard,
  Department,
  DocMeta,
  JobPost,
  Role,
  Status,
  Visibility,
} from "./types";

const MAX_FILE = 750 * 1024;
const ROLES: Role[] = ["employee", "manager", "hr"];
const STATUSES: Status[] = ["active", "leave", "inactive"];
const VISIBILITIES: Visibility[] = ["private", "team", "company"];

const PERSON_SQL = `
  select
    e.id,
    e.user_id as "userId",
    e.email,
    e.full_name as "fullName",
    e.title,
    e.department_id as "departmentId",
    d.name as "departmentName",
    e.manager_id as "managerId",
    m.full_name as "managerName",
    e.role,
    e.phone,
    e.location,
    e.bio,
    e.start_date::text as "startDate",
    e.status
  from employees e
  join departments d on d.id = e.department_id
  left join employees m on m.id = e.manager_id
`;

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") throw new Error("Invalid request.");
  return input as Record<string, unknown>;
}

function requiredText(value: unknown, max: number, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} is required.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function optionalText(value: unknown, max: number, label: string): string {
  if (value == null) return "";
  if (typeof value !== "string") throw new Error(`${label} is invalid.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function emailOf(value: unknown): string {
  const email = requiredText(value, 200, "Email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  return email;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`${label} is not valid.`);
  }
  return value as T;
}

function dateOf(value: unknown): string {
  const date = requiredText(value, 10, "Start date");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Use a YYYY-MM-DD date.");
  return date;
}

async function writeAudit(
  sql: Sql,
  actorUserId: string,
  action: string,
  entity: string,
  entityId: string | null,
  detail: string,
) {
  await sql.query(
    `insert into audit_logs (actor_user_id, action, entity, entity_id, detail)
     values ($1, $2, $3, $4, $5)`,
    [actorUserId, action, entity, entityId, detail.slice(0, 500)],
  );
}

async function personById(sql: Sql, id: string): Promise<Actor | null> {
  const rows = await sql.query<Actor>(`${PERSON_SQL} where e.id = $1`, [id]);
  return rows[0] ?? null;
}

async function personByUser(sql: Sql, userId: string): Promise<Actor | null> {
  const rows = await sql.query<Actor>(`${PERSON_SQL} where e.user_id = $1`, [userId]);
  return rows[0] ?? null;
}

async function ensureActor(sql: Sql, userId: string): Promise<Actor> {
  const existing = await personByUser(sql, userId);
  if (existing) return existing;

  const accounts = await sql.query<{ name: string; email: string }>(
    `select name, email from "user" where id = $1`,
    [userId],
  );
  const account = accounts[0];
  if (!account?.email) throw new Error("Account not found.");
  const email = account.email.toLowerCase();

  const claimable = await sql.query<Actor>(
    `${PERSON_SQL} where lower(e.email) = $1 and e.user_id is null`,
    [email],
  );
  if (claimable[0]) {
    await sql.query(`update employees set user_id = $1, updated_at = now() where id = $2`, [
      userId,
      claimable[0].id,
    ]);
    const linked = await personByUser(sql, userId);
    if (!linked) throw new Error("Could not link your directory record.");
    await writeAudit(
      sql,
      userId,
      "link",
      "employee",
      linked.id,
      `${linked.fullName} signed in and claimed their directory record.`,
    );
    return linked;
  }

  const hr = await sql.query<{ n: number }>(
    `select count(*)::int as n from employees where role = 'hr' and user_id is not null`,
  );
  const role: Role = (hr[0]?.n ?? 0) === 0 ? "hr" : "employee";
  const id = `emp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const fullName = (account.name || email.split("@")[0] || "New colleague").trim().slice(0, 80);
  const title = role === "hr" ? "People administrator" : "Employee";
  await sql.query(
    `insert into employees (
       id, user_id, email, full_name, title, department_id, role, location, bio, start_date
     ) values ($1, $2, $3, $4, $5, 'dep_people', $6, 'Lisbon', '', current_date)`,
    [id, userId, email, fullName, title, role],
  );
  await writeAudit(
    sql,
    userId,
    "create",
    "employee",
    id,
    role === "hr"
      ? `${fullName} became the first signed-in people administrator.`
      : `${fullName} joined the directory.`,
  );
  const created = await personByUser(sql, userId);
  if (!created) throw new Error("Could not open your profile.");
  return created;
}

function scopeFor(actor: Actor, target: Actor): "all" | "team" | "personal" | "none" {
  if (actor.role === "hr") return "all";
  if (actor.role === "manager" && target.managerId === actor.id && actor.id !== target.id) {
    return "team";
  }
  if (actor.id === target.id) return "personal";
  return "none";
}

async function assertLastAdmin(sql: Sql, target: Actor, nextRole: Role) {
  if (target.role !== "hr" || nextRole === "hr" || !target.userId) return;
  const rows = await sql.query<{ n: number }>(
    `select count(*)::int as n from employees
     where role = 'hr' and user_id is not null and id <> $1`,
    [target.id],
  );
  if ((rows[0]?.n ?? 0) === 0) {
    throw new Error("Jigsaw needs at least one signed-in people administrator.");
  }
}

const DOC_WHERE = `
  (
    $1 = 'hr'
    or d.visibility = 'company'
    or d.owner_employee_id = $2
    or (
      $1 = 'manager'
      and d.visibility = 'team'
      and (
        d.department_id = $3
        or d.owner_employee_id in (select id from employees where manager_id = $2)
      )
    )
  )
`;

function docParams(actor: Actor): [Role, string, string] {
  return [actor.role, actor.id, actor.departmentId];
}

function sniff(bytes: Buffer, mime: string): boolean {
  if (mime === "application/pdf") return bytes.subarray(0, 5).toString("utf8").startsWith("%PDF-");
  if (mime === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (mime === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "text/plain" || mime === "text/csv") return !bytes.includes(0);
  return false;
}

export const listJobs = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  return sql.query<JobPost>(
    `select
       j.id,
       j.title,
       d.name as "departmentName",
       j.location,
       j.employment_type as "employmentType",
       j.summary,
       j.posted_at::text as "postedAt"
     from job_posts j
     join departments d on d.id = j.department_id
     order by j.posted_at desc, j.title`,
  );
});

export const submitContact = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    const name = requiredText(body.name, 80, "Name");
    const email = emailOf(body.email);
    const company = optionalText(body.company, 80, "Company");
    const message = requiredText(body.message, 2000, "Message");
    if (message.length < 12) throw new Error("Tell us a little more than that.");
    return { name, email, company, message };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const recent = await sql.query<{ n: number }>(
      `select count(*)::int as n from rate_events
       where bucket = $1 and created_at > now() - interval '1 hour'`,
      [`contact:${data.email}`],
    );
    if ((recent[0]?.n ?? 0) >= 4) {
      throw new Error("Too many messages from this email. Try again in an hour.");
    }
    await sql.query(`insert into rate_events (bucket) values ($1)`, [`contact:${data.email}`]);
    await sql.query(
      `insert into contact_messages (name, email, company, message) values ($1, $2, $3, $4)`,
      [data.name, data.email, data.company, data.message],
    );
    return { ok: true as const };
  });

export const guardAuthAttempt = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { email: emailOf(body.email) };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    const recent = await sql.query<{ n: number }>(
      `select count(*)::int as n from rate_events
       where bucket = $1 and created_at > now() - interval '15 minutes'`,
      [`auth:${data.email}`],
    );
    if ((recent[0]?.n ?? 0) >= 8) {
      throw new Error("Too many sign-in attempts. Wait 15 minutes and try again.");
    }
    return { ok: true as const };
  });

export const recordAuthFailure = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { email: emailOf(body.email) };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql.query(`insert into rate_events (bucket) values ($1)`, [`auth:${data.email}`]);
    return { ok: true as const };
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return ensureActor(sql, context.userId);
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Dashboard> => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    const counts = await sql.query<{ headcount: number; active: number; onLeave: number }>(
      `select
         cast(count(*) as int) as headcount,
         cast(count(*) filter (where status = 'active') as int) as active,
         cast(count(*) filter (where status = 'leave') as int) as "onLeave"
       from employees`,
    );
    const byDepartment = await sql.query<{ name: string; count: number }>(
      `select d.name, count(e.id)::int as count
       from departments d
       left join employees e on e.department_id = d.id and e.status <> 'inactive'
       group by d.name
       order by d.name`,
    );
    const roles = await sql.query<{ n: number }>(`select count(*)::int as n from job_posts`);
    const docs = await sql.query<{ n: number }>(
      `select count(*)::int as n from documents d where ${DOC_WHERE}`,
      docParams(actor),
    );
    const recent = await sql.query<Actor>(
      `${PERSON_SQL} where e.status <> 'inactive' order by e.start_date desc, e.full_name limit 5`,
    );
    const messages =
      actor.role === "hr"
        ? await sql.query<ContactNote>(
            `select id, name, email, company, message, created_at::text as "createdAt"
             from contact_messages order by created_at desc limit 8`,
          )
        : [];
    return {
      headcount: counts[0]?.headcount ?? 0,
      active: counts[0]?.active ?? 0,
      onLeave: counts[0]?.onLeave ?? 0,
      byDepartment,
      openRoles: roles[0]?.n ?? 0,
      documentCount: docs[0]?.n ?? 0,
      recent,
      messages,
    };
  });

export const listDirectory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureActor(sql, context.userId);
    return sql.query<Actor>(`${PERSON_SQL} order by e.full_name`);
  });

export const getPerson = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { id: requiredText(body.id, 80, "Person") };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureActor(sql, context.userId);
    const person = await personById(sql, data.id);
    if (!person) throw new Error("That person is not in the directory.");
    return person;
  });

export const createEmployee = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    const managerRaw = optionalText(body.managerId, 80, "Manager");
    return {
      fullName: requiredText(body.fullName, 80, "Name"),
      email: emailOf(body.email),
      title: requiredText(body.title, 80, "Title"),
      departmentId: requiredText(body.departmentId, 80, "Department"),
      managerId: managerRaw || null,
      role: oneOf(body.role, ROLES, "Role"),
      phone: optionalText(body.phone, 40, "Phone"),
      location: requiredText(body.location, 80, "Location"),
      bio: optionalText(body.bio, 500, "Bio"),
      startDate: dateOf(body.startDate),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    if (actor.role !== "hr") throw new Error("Only people administrators can add employees.");
    const department = await sql.query<{ id: string }>(`select id from departments where id = $1`, [
      data.departmentId,
    ]);
    if (!department[0]) throw new Error("Choose a real department.");
    if (data.managerId) {
      const manager = await personById(sql, data.managerId);
      if (!manager) throw new Error("Choose a real manager.");
    }
    const id = `emp_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    try {
      await sql.query(
        `insert into employees (
           id, email, full_name, title, department_id, manager_id, role, phone, location, bio, start_date
         ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          id,
          data.email,
          data.fullName,
          data.title,
          data.departmentId,
          data.managerId,
          data.role,
          data.phone,
          data.location,
          data.bio,
          data.startDate,
        ],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("unique") || message.includes("employees_email")) {
        throw new Error("That email is already in the directory.");
      }
      throw err;
    }
    await writeAudit(
      sql,
      context.userId,
      "create",
      "employee",
      id,
      `${actor.fullName} added ${data.fullName} as ${data.role}.`,
    );
    const created = await personById(sql, id);
    if (!created) throw new Error("Employee was not saved.");
    return created;
  });

export const updateEmployee = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    const managerRaw = body.managerId == null ? "" : optionalText(body.managerId, 80, "Manager");
    return {
      id: requiredText(body.id, 80, "Person"),
      fullName: requiredText(body.fullName, 80, "Name"),
      title: requiredText(body.title, 80, "Title"),
      departmentId: requiredText(body.departmentId, 80, "Department"),
      managerId: managerRaw || null,
      role: oneOf(body.role, ROLES, "Role"),
      phone: optionalText(body.phone, 40, "Phone"),
      location: requiredText(body.location, 80, "Location"),
      bio: optionalText(body.bio, 500, "Bio"),
      status: oneOf(body.status, STATUSES, "Status"),
      startDate: dateOf(body.startDate),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    const target = await personById(sql, data.id);
    if (!target) throw new Error("That person is not in the directory.");
    const scope = scopeFor(actor, target);
    if (scope === "none") throw new Error("You cannot edit this record.");

    const next = {
      fullName: target.fullName,
      title: target.title,
      departmentId: target.departmentId,
      managerId: target.managerId,
      role: target.role,
      phone: target.phone,
      location: target.location,
      bio: target.bio,
      status: target.status,
      startDate: target.startDate,
    };

    if (scope === "personal" || scope === "team" || scope === "all") {
      next.phone = data.phone;
      next.location = data.location;
      next.bio = data.bio;
    }
    if (scope === "team" || scope === "all") {
      next.title = data.title;
      if (data.status === "inactive" && scope !== "all") {
        throw new Error("Only people administrators can mark someone inactive.");
      }
      next.status = data.status;
    }
    if (scope === "all") {
      next.fullName = data.fullName;
      next.departmentId = data.departmentId;
      next.managerId = data.managerId;
      next.role = data.role;
      next.startDate = data.startDate;
      next.status = data.status;
    }

    if (next.managerId === target.id) throw new Error("A person cannot report to themselves.");
    if (next.managerId) {
      const manager = await personById(sql, next.managerId);
      if (!manager) throw new Error("Choose a real manager.");
      if (manager.managerId === target.id) throw new Error("That reporting line loops.");
    }
    const department = await sql.query<{ id: string }>(`select id from departments where id = $1`, [
      next.departmentId,
    ]);
    if (!department[0]) throw new Error("Choose a real department.");
    await assertLastAdmin(sql, target, next.role);

    await sql.query(
      `update employees set
         full_name = $2,
         title = $3,
         department_id = $4,
         manager_id = $5,
         role = $6,
         phone = $7,
         location = $8,
         bio = $9,
         status = $10,
         start_date = $11,
         updated_at = now()
       where id = $1`,
      [
        target.id,
        next.fullName,
        next.title,
        next.departmentId,
        next.managerId,
        next.role,
        next.phone,
        next.location,
        next.bio,
        next.status,
        next.startDate,
      ],
    );
    const changedRole = next.role !== target.role;
    await writeAudit(
      sql,
      context.userId,
      changedRole ? "role.change" : "update",
      "employee",
      target.id,
      changedRole
        ? `${actor.fullName} changed ${next.fullName} from ${target.role} to ${next.role}.`
        : `${actor.fullName} updated ${next.fullName}.`,
    );
    const saved = await personById(sql, target.id);
    if (!saved) throw new Error("Update did not save.");
    return saved;
  });

export const listDepartments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await ensureActor(sql, context.userId);
    return sql.query<Department>(
      `select
         d.id,
         d.name,
         d.code,
         d.description,
         count(e.id)::int as headcount
       from departments d
       left join employees e on e.department_id = d.id and e.status <> 'inactive'
       group by d.id
       order by d.name`,
    );
  });

export const saveDepartment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    const id = optionalText(body.id, 80, "Department");
    return {
      id: id || null,
      name: requiredText(body.name, 60, "Name"),
      description: requiredText(body.description, 280, "Description"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    if (actor.role !== "hr") throw new Error("Only people administrators can edit departments.");
    if (data.id) {
      const existing = await sql.query<{ id: string }>(`select id from departments where id = $1`, [
        data.id,
      ]);
      if (!existing[0]) throw new Error("That department does not exist.");
      try {
        await sql.query(`update departments set name = $2, description = $3 where id = $1`, [
          data.id,
          data.name,
          data.description,
        ]);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message.toLowerCase().includes("unique")) throw new Error("A department already uses that name.");
        throw err;
      }
      await writeAudit(
        sql,
        context.userId,
        "update",
        "department",
        data.id,
        `${actor.fullName} updated the ${data.name} department.`,
      );
      return { id: data.id };
    }
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 20);
    const id = `dep_${slug || "team"}_${crypto.randomUUID().slice(0, 4)}`;
    const code = (slug || "new").replace(/-/g, "").slice(0, 4).toUpperCase() || "NEW";
    try {
      await sql.query(
        `insert into departments (id, name, code, description) values ($1, $2, $3, $4)`,
        [id, data.name, `${code}${id.slice(-2).toUpperCase()}`, data.description],
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.toLowerCase().includes("unique")) throw new Error("A department already uses that name.");
      throw err;
    }
    await writeAudit(
      sql,
      context.userId,
      "create",
      "department",
      id,
      `${actor.fullName} opened the ${data.name} department.`,
    );
    return { id };
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    return sql.query<DocMeta>(
      `select
         d.id,
         d.title,
         d.filename,
         d.mime,
         d.size_bytes as "sizeBytes",
         d.visibility,
         d.owner_employee_id as "ownerEmployeeId",
         e.full_name as "ownerName",
         dep.name as "departmentName",
         d.created_at::text as "createdAt"
       from documents d
       join employees e on e.id = d.owner_employee_id
       left join departments dep on dep.id = d.department_id
       where ${DOC_WHERE}
       order by d.created_at desc`,
      docParams(actor),
    );
  });

export const uploadDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    const title = requiredText(body.title, 120, "Title");
    const filename = requiredText(body.filename, 120, "File name").replace(/[/\\]/g, "");
    if (!/^[A-Za-z0-9._ -]+$/.test(filename)) throw new Error("Use a plain file name.");
    const mime = oneOf(
      body.mime,
      ["application/pdf", "image/png", "image/jpeg", "text/plain", "text/csv"] as const,
      "File type",
    );
    const visibility = oneOf(body.visibility, VISIBILITIES, "Visibility");
    if (typeof body.contentBase64 !== "string" || body.contentBase64.length < 8) {
      throw new Error("Choose a file to upload.");
    }
    if (body.contentBase64.length > Math.ceil((MAX_FILE * 4) / 3) + 16) {
      throw new Error("Files must be 750 KB or smaller.");
    }
    return { title, filename, mime, visibility, contentBase64: body.contentBase64 };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    if (actor.role === "employee" && data.visibility !== "private") {
      throw new Error("Employees can upload private files only.");
    }
    if (actor.role === "manager" && data.visibility === "company") {
      throw new Error("Only people administrators can publish a company-wide file.");
    }
    const bytes = Buffer.from(data.contentBase64, "base64");
    if (bytes.length === 0 || bytes.length > MAX_FILE) {
      throw new Error("Files must be 750 KB or smaller.");
    }
    if (!sniff(bytes, data.mime)) throw new Error("That file does not match its type.");
    const id = `doc_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    await sql.query(
      `insert into documents (
         id, owner_employee_id, department_id, title, filename, mime, size_bytes,
         content_base64, visibility, uploaded_by_user_id
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        actor.id,
        actor.departmentId,
        data.title,
        data.filename,
        data.mime,
        bytes.length,
        data.contentBase64,
        data.visibility,
        context.userId,
      ],
    );
    await writeAudit(
      sql,
      context.userId,
      "upload",
      "document",
      id,
      `${actor.fullName} uploaded “${data.title}” (${data.visibility}).`,
    );
    return { id };
  });

export const downloadDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { id: requiredText(body.id, 80, "Document") };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    const rows = await sql.query<{
      title: string;
      filename: string;
      mime: string;
      contentBase64: string;
    }>(
      `select d.title, d.filename, d.mime, d.content_base64 as "contentBase64"
       from documents d
       where d.id = $4 and ${DOC_WHERE}`,
      [...docParams(actor), data.id],
    );
    const doc = rows[0];
    if (!doc) throw new Error("You cannot download that file.");
    await writeAudit(
      sql,
      context.userId,
      "download",
      "document",
      data.id,
      `${actor.fullName} downloaded “${doc.title}”.`,
    );
    return doc;
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const body = asRecord(input);
    return { id: requiredText(body.id, 80, "Document") };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    const rows = await sql.query<{ id: string; title: string; owner: string }>(
      `select id, title, owner_employee_id as owner from documents where id = $1`,
      [data.id],
    );
    const doc = rows[0];
    if (!doc) throw new Error("That file is already gone.");
    if (actor.role !== "hr" && doc.owner !== actor.id) {
      throw new Error("You can only remove your own files.");
    }
    await sql.query(`delete from documents where id = $1`, [doc.id]);
    await writeAudit(
      sql,
      context.userId,
      "delete",
      "document",
      doc.id,
      `${actor.fullName} removed “${doc.title}”.`,
    );
    return { ok: true as const };
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const actor = await ensureActor(sql, context.userId);
    if (actor.role === "employee") throw new Error("Audit history is limited to managers and people administrators.");
    if (actor.role === "hr") {
      return sql.query<AuditRow>(
        `select
           a.id,
           a.action,
           a.entity,
           a.detail,
           a.created_at::text as "createdAt",
           coalesce(e.full_name, 'System') as "actorName"
         from audit_logs a
         left join employees e on e.user_id = a.actor_user_id
         order by a.created_at desc
         limit 150`,
      );
    }
    return sql.query<AuditRow>(
      `select
         a.id,
         a.action,
         a.entity,
         a.detail,
         a.created_at::text as "createdAt",
         coalesce(e.full_name, 'System') as "actorName"
       from audit_logs a
       left join employees e on e.user_id = a.actor_user_id
       where a.actor_user_id = $1
          or a.entity_id = $2
          or a.entity_id in (select id from employees where manager_id = $2)
       order by a.created_at desc
       limit 150`,
      [context.userId, actor.id],
    );
  });
