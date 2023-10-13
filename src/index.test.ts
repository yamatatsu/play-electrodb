import { service } from "./db/index.js";

test("test", async () => {
  await service.entities.gateway
    .create({
      gatewayId: "test",
      name: "test",
      physicalId: "test",
      registrationCode: "test",
      sensorUnits: [
        {
          sensorUnitId: "test",
          name: "test",
          observeMode: "temperatureHumidityObserve",
          macAddress: "test",
        },
      ],
      createdHow: "test",
      createdBy: "test",
    })
    .go();
});
