import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../schemas/users.schema";
import { IUser } from "../models/user.interface";

const register = async (req: express.Request, res: express.Response) => {
  const { username, email, password } = req.body;

  const used: IUser | null = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (used) {
    const message =
      used.username === username
        ? "Username already exists"
        : "Email has already been used";

    res.status(used.username === username ? 403 : 409).json({ message });
    return;
  }

  const user = new User<IUser>({
    username,
    email,
    password,
  });

  const auth_token: string = jwt.sign(
    { data: { username } },
    String(process.env.JWT_SECRET_KEY),
    {
      expiresIn: String(process.env.JWT_LONG_LIVED),
    }
  );

  await user.save();
  res.status(200).send({ message: "success", auth_token });
};

const login = async (req: express.Request, res: express.Response) => {
  const { username, password } = req.body;

  const user: IUser | null = await User.findOne({ username });

  if (!user) {
    res.status(403).json({ message: "User does not exist" });
    return;
  }

  const isPasswordValid: boolean = password === user.password;

  if (!isPasswordValid) {
    res.status(403).json({ message: "Invalid password" });
    return;
  }

  const auth_token = jwt.sign(
    { data: { username: user.username } },
    String(process.env.JWT_SECRET_KEY),
    {
      expiresIn: String(process.env.JWT_LONG_LIVED),
    }
  );

  res.status(200).json({ message: "Login successful", auth_token });
};

const getAuthenticatedUser = async (
  req: express.Request,
  res: express.Response
) => {
  const { token } = req.body;
  const secretKey: string = process.env.JWT_SECRET_KEY || "";

  if (!token || !secretKey) {
    res.status(400).json({ error: "Token or secret key not provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    if (typeof decoded === "object" && decoded !== null && "data" in decoded) {
      const authenticatedUser: IUser | null = await User.findOne({
        username: (decoded as JwtPayload).data.username,
      });

      if (!authenticatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.status(200).json({ authenticatedUser });
      return;
    } else {
      throw new Error("Invalid token payload structure");
    }
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export default { register, login, getAuthenticatedUser };
