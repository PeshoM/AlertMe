import express from "express";
import admin from "../config/firebase-config";
import { IUser } from "../models/user.interface";
import { User } from "../schemas/users.schema";

const sendNotification = async (
  title: string,
  body: string,
  fcmToken: string
) => {
  const message: admin.messaging.TokenMessage = {
    token: fcmToken,
    notification: {
      title,
      body,
    },
    data: {
      screen: "FriendRequests",
    },
    android: {
      priority: "high",
      notification: {
        clickAction: "OPEN_NOTIFICATION",
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

const sendFriendRequest = async (
  req: express.Request,
  res: express.Response
) => {
  const { currUserId, userToRequestId } = req.body;

  const currUser: IUser | null = await User.findById(currUserId);
  const userToRequest: IUser | null = await User.findById(userToRequestId);

  if (!currUser || !userToRequest) {
    res.json({ message: "Invalid data" });
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
    body: string = `${currUser?.username} has sent you a friend request!`;

  userToRequest?.devices.map((fcmToken: string) => {
    sendNotification(title, body, fcmToken);
  });

  res.status(200).json({ message: "Sucess" });
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
    body: string = `${currUser?.username} has accepted your friend request!`;

  userSending?.devices.map((fcmToken: string) => {
    sendNotification(title, body, fcmToken);
  });

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

export default { sendFriendRequest, acceptFriendRequest, rejectFriendRequest };
