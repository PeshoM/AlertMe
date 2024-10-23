import express from "express";
import jwt from "jsonwebtoken";
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
        ? "User already exists"
        : "Email is already registered";

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

  const authToken = jwt.sign(
    { data: { username: user.username } },
    String(process.env.JWT_SECRET_KEY),
    {
      expiresIn: String(process.env.JWT_LONG_LIVED),
    }
  );

  res.status(200).json({ message: "Login successful", authToken });
};

export default { register, login };
