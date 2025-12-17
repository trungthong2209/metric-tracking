declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
      };
      validatedQuery?: any,
      validatedBody?: any,
    }
  }
}

export {};