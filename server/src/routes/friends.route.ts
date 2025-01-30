import express, { Router } from "express";
import friendsController from "../controllers/friends.controller";

const router: Router = express();

router.post("/sendFriendRequest", friendsController.sendFriendRequest);
router.post("/acceptFriendRequest", friendsController.acceptFriendRequest);
router.post("/rejectFriendRequest", friendsController.rejectFriendRequest);
router.post("/fetchFriends", friendsController.fetchFriends);
router.post("/searchUsers", friendsController.searchUsers);

export default router;