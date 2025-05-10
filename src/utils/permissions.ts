import { GuildMember } from 'discord.js';

/**
 * Check if a guild member has a specific role by ID
 */
export function hasRole(member: GuildMember, roleId: string): boolean {
  return member.roles.cache.has(roleId);
}

/**
 * Check if a guild member has admin permissions
 */
export function isAdmin(member: GuildMember): boolean {
  return member.permissions.has('Administrator');
}