import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['userid'] as string || '100';

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized: Missing userid header" });
  }

  req.user = { id: userId };
  
  next();
};
