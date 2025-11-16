// Express types
import { Request, Response } from 'express';

export type ExpressHandler = (req: Request, res: Response) => void;
