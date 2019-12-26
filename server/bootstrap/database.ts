import { createConnection } from "typeorm";
import { refreshLibrary } from "../app/services/library.service";

export async function initializeDB() {
  await createConnection();

  refreshLibrary();
}
