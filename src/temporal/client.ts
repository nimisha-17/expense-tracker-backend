import { Connection, Client } from "@temporalio/client";

export const getTemporalClient = async (): Promise<Client> => {
  const temporalAddress =
  process.env.TEMPORAL_ADDRESS || "localhost:7233";

const connection = await Connection.connect({
  address: temporalAddress
});

  return new Client({
    connection
  });
};