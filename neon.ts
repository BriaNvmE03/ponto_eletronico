import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "ponto-eletronico": { access: "public_read" }
  }
});
