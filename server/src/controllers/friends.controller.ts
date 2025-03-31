import express from "express";
import admin from "../config/firebase-config";
import { IUser, IUserWithFriends } from "../models/user.interface";
import { User } from "../schemas/users.schema";

const sendNotification = async (
  title: string,
  body: string,
  fcmToken: string,
  data: {}
) => {
  const message: admin.messaging.TokenMessage = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data,
    android: {
      priority: "high",
      notification: {
        clickAction: "FLUTTER_NOTIFICATION_CLICK",
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          badge: 1,
          sound: "default",
          contentAvailable: true,
        },
      },
      headers: {
        "apns-priority": "10",
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

const interactionHandler = async (
  status: string,
  currUser: IUser,
  fcmToken: string
) => {
  const message: admin.messaging.TokenMessage = {
    token: fcmToken,
    data: { status, currUser: JSON.stringify(currUser) },
    notification: {
      title: "",
      body: "",
    },
    android: { priority: "high" },
    apns: { headers: { "apns-priority": "10" } },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Data sent successfully:", response);
  } catch (error) {
    console.error("Error sending data:", error);
  }
};

const sendFriendRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { currUserId, userToRequestId } = req.body;

  const currUser: IUser | null = await User.findById(currUserId);
  const userToRequest: IUser | null = await User.findById(userToRequestId);

  if (!currUser || !userToRequest) {
    res.status(400).json({ message: "Invalid data" });
    return;
  }

  if (!currUser.sentFriendRequests.includes(userToRequestId)) {
    currUser.sentFriendRequests.push(userToRequestId);
    await currUser.save();
  }

  if (!userToRequest.receivedFriendRequests.includes(currUserId)) {
    userToRequest.receivedFriendRequests.push(currUserId);
    await userToRequest.save();
  }

  const title: string = "New Friend Request",
    body: string = `${currUser?.username} has sent you a friend request!`,
    data = { screen: "Friends" };

  const validTokens: string[] = [];
  for (const fcmToken of userToRequest.devices) {
    try {
      await admin.messaging().send({
        token: fcmToken,
        data: { test: "ping" },
      });
      validTokens.push(fcmToken);
    } catch (error) {
      await User.updateOne(
        { _id: userToRequest._id },
        { $pull: { devices: fcmToken } }
      );
    }
  }

  validTokens.forEach((fcmToken) => {
    interactionHandler("REQUEST", currUser, fcmToken);
    sendNotification(title, body, fcmToken, data);
  });

  res.status(200).json({ message: "Success" });
};

const acceptFriendRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { currUserId, userSendingId } = req.body;

  const currUser: IUser | null = await User.findById(currUserId);
  const userSending: IUser | null = await User.findById(userSendingId);

  if (!currUser || !userSending) {
    res.json({ message: "Invalid data" });
    return;
  }

  currUser.receivedFriendRequests = currUser.receivedFriendRequests.filter(
    (id) => id.toString() !== userSendingId
  );

  if (!currUser.friends.includes(userSendingId))
    currUser.friends.push(userSendingId);

  await currUser.save();

  userSending.sentFriendRequests = userSending.sentFriendRequests.filter(
    (id) => id.toString() !== currUserId
  );

  if (!userSending.friends.includes(currUserId))
    userSending.friends.push(currUserId);

  await userSending.save();

  const title: string = "AlertMe",
    body: string = `${currUser?.username} has accepted your friend request!`,
    data: { screen: string } = { screen: "Friends" };

  userSending.devices.map((fcmToken: string) => {
    interactionHandler("ACCEPTED", currUser, fcmToken);
  });

  userSending?.devices.map((fcmToken: string) =>
    sendNotification(title, body, fcmToken, data)
  );

  res.status(200).json({ message: "Sucess" });
};

const rejectFriendRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { currUserId, userSendingId } = req.body;

  const currUser: IUser | null = await User.findById(currUserId);
  const userSending: IUser | null = await User.findById(userSendingId);

  if (!currUser || !userSending) {
    res.json({ message: "Invalid data" });
    return;
  }

  userSending.devices.map((fcmToken: string) => {
    interactionHandler("REJECTED", currUser, fcmToken);
  });

  currUser.receivedFriendRequests = currUser.receivedFriendRequests.filter(
    (id) => id.toString() !== userSendingId
  );

  await currUser.save();

  userSending.sentFriendRequests = userSending.sentFriendRequests.filter(
    (id) => id.toString() !== currUserId
  );

  await userSending.save();

  res.status(200).json({ message: "Sucess" });
};

const removeFriend = async (req: express.Request, res: express.Response) => {
  const { currUserId, userToRemoveId } = req.body;

  const currUser: IUser | null = await User.findById(currUserId);
  const userToRemove: IUser | null = await User.findById(userToRemoveId);

  if (!currUser || !userToRemove) {
    res.json({ message: "Invalid data" });
    return;
  }

  currUser.friends = currUser.friends.filter(
    (id) => id.toString() !== userToRemoveId
  );

  userToRemove.friends = userToRemove.friends.filter(
    (id) => id.toString() !== currUserId
  );

  userToRemove.devices.map((fcmToken: string) => {
    interactionHandler("REMOVED", currUser, fcmToken);
  });

  await currUser.save();
  await userToRemove.save();

  res.status(200).json({ message: "Sucess" });
};

const fetchFriends = async (req: express.Request, res: express.Response) => {
  const { userId } = req.body;

  const user: IUser | null = await User.findById(userId);

  if (!user) {
    res.json({ message: "Invalid data" });
    return;
  }

  const pipeline = [
    {
      $match: { _id: user._id },
    },
    {
      $lookup: {
        from: "users",
        localField: "friends",
        foreignField: "_id",
        as: "friendsList",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "receivedFriendRequests",
        foreignField: "_id",
        as: "receivedFriendRequests",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sentFriendRequests",
        foreignField: "_id",
        as: "sentFriendRequests",
      },
    },
  ];

  const [result]: IUserWithFriends[] = await User.aggregate(pipeline).exec();

  res.json({
    message: "success",
    friendsList: result.friendsList,
    receivedFriendRequests: result.receivedFriendRequests,
    sentFriendRequests: result.sentFriendRequests,
  });
};

const searchUsers = async (req: express.Request, res: express.Response) => {
  const { input } = req.body as { input: string };

  const escapedInput = input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const results = await User.find({
    username: { $regex: `^${escapedInput}`, $options: "i" },
  });

  res.json({ message: "success", results });
};

const fetchOpenedUser = async (req: express.Request, res: express.Response) => {
  const { openedUserId } = req.body as { openedUserId: string };

  const openedUser: IUser | null = await User.findById(openedUserId);

  if (!openedUser) {
    res.json({ message: "User doesn't exist" });
    return;
  }

  res.json({ message: "success", openedUser });
};

export default {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  fetchFriends,
  searchUsers,
  fetchOpenedUser,
};
