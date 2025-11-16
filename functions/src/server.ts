import {configEnv} from "./config/env";
import {createApp} from "./app";

configEnv();

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 Docs: http://localhost:${PORT}/docs`);
});
