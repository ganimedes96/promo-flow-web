export enum Role {
  admin = "admin",
  member = "member",
}

export enum Permission {
  managePromotions = "managePromotions",
  all = "all",
  // User permissions
  viewUsers = "viewUsers",
  createUser = "createUser",
  updateUser = "updateUser",
  deleteUser = "deleteUser",
  // Role permissions
  viewRoles = "viewRoles",
  createRole = "createRole",
  updateRole = "updateRole",
  deleteRole = "deleteRole",
  // Event permissions
  viewEvents = "viewEvents",
  createEvents = "createEvent",
  updateEvents = "updateEvent",
  deleteEvents = "deleteEvent",
}
