import { Connection, Client } from "@temporalio/client";

export const getTemporalClient = async (): Promise<Client> => {
  const connection = await Connection.connect({
    address: "localhost:7233"
  });

  return new Client({
    connection
  });
};