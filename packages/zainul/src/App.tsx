import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import chakraTheme from "./styles/chakra-theme";
import Routes from "./routing/RouteConfig";
import Titumir from "./services/api/titumir";
import { QueryClient, QueryClientProvider } from "react-query";
import AuthorizationConfig from "./state/AuthorizationConfig";

export const titumirApi = new Titumir("http://localhost:4000");

const queryClient = new QueryClient();

function App() {
    return (
        <Router>
            <AuthorizationConfig>
                <QueryClientProvider client={queryClient}>
                    {/* <ReactQueryDevtools /> */}
                    <ChakraProvider theme={chakraTheme}>
                        <Routes></Routes>
                    </ChakraProvider>
                </QueryClientProvider>
            </AuthorizationConfig>
        </Router>
    );
}

export default App;
