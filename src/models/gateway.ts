import { randomUUID, randomInt } from "node:crypto";
import { Workspace } from "./workspace.js";
import { User } from "./user.js";

export type GatewayPreAttached = {
  registrationCode: string;
  gatewayId: string;
  imei: string;
  name: string;
  sensorUnits: { sensorUnitId: string; name: string }[];
};

export type Gateway = GatewayPreAttached & {
  workspaceId: string;
  attachedBy: string;
};

export function createGateway(
  imei: string,
  gatewayName: string,
): GatewayPreAttached {
  const registrationCode = "A" + randomInt(99999).toString().padStart(5, "0");
  const uuid = randomUUID();

  return {
    registrationCode,
    gatewayId: `gw-${uuid}`,
    imei: imei,
    name: gatewayName,
    sensorUnits: [...Array(6)].map((_, i) => ({
      sensorUnitId: `su-${uuid}-${i + 1}`,
      name: `sensor unit ${i + 1}`,
    })),
  };
}

export function attachToWorkspace(
  gatewayPreAttached: GatewayPreAttached,
  workspace: Workspace,
  user: User,
) {
  return {
    ...gatewayPreAttached,
    workspaceId: workspace.workspaceId,
    attachedBy: user.userId,
  };
}
