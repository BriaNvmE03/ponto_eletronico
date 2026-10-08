import { execSync } from 'child_process';

console.log("🌱 Iniciando Seed Múltipla...");

try {
  console.log("=========================================");
  console.log("🚀 Executando Seed de Teste (SuperAdmin)");
  execSync('npx ts-node prisma/seed-test.ts', { stdio: 'inherit' });

  console.log("=========================================");
  console.log("🚀 Executando Seed de Planos");
  execSync('npx ts-node prisma/seed-plans.ts', { stdio: 'inherit' });

  console.log("=========================================");
  console.log("✅ TODAS AS SEEDS FORAM EXECUTADAS COM SUCESSO!");
} catch (error) {
  console.error("❌ Erro ao executar seeds:", error);
  process.exit(1);
}
