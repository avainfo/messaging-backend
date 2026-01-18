
import { Request, Response, NextFunction } from "express";

// Mock the auth middleware globally to allow all requests in tests
jest.mock("../middlewares/auth", () => ({
    validateFirebaseIdToken: (req: Request, res: Response, next: NextFunction) => {
        // Inject a dummy user so controllers don't crash if they check req.user
        req.user = {
            uid: "test-user-id",
            email: "test@example.com",
            aud: "test-project",
            auth_time: 123,
            exp: 123,
            firebase: { identities: {}, sign_in_provider: "custom" },
            iat: 123,
            iss: "test-issuer",
            sub: "test-user-id"
        };
        next();
    },
}));
