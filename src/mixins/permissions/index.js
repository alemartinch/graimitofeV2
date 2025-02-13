import { eventPermissions } from "@/mixins/permissions/eventPermissions";
import { findingPermissions } from "@/mixins/permissions/findingPermissions";
import { causePermissions } from "@/mixins/permissions/causePermissions";
import { actionPermissions } from "@/mixins/permissions/actionPermissions";
import { harPermissions } from "@/mixins/permissions/harPermissions";

export const permissions = {
  name: "permissions",
  mixins: [
    eventPermissions,
    findingPermissions,
    causePermissions,
    actionPermissions,
    harPermissions,
  ],
};
