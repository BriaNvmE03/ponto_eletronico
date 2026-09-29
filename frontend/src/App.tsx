import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { AppRoutes } from "./routes";

// Criação do cliente do React Query
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ponto-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
