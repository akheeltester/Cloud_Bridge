import type { Actor, Role, Visibility } from "./types";

export type EditScope = "all" | "team" | "personal" | "none";

export function editScope(actor: Actor, target: Actor): EditScope {
  if (actor.role === "hr") return "all";
  if (actor.role === "manager" && target.managerId === actor.id && actor.id !== target.id) {
    return "team";
  }
  if (actor.id === target.id) return "personal";
  return "none";
}

export function canUpload(role: Role, visibility: Visibility): boolean {
  if (role === "hr") return true;
  if (role === "manager") return visibility === "private" || visibility === "team";
  return visibility === "private";
}

export function roleLabel(role: Role): string {
  if (role === "hr") return "People admin";
  if (role === "manager") return "Manager";
  return "Employee";
}
