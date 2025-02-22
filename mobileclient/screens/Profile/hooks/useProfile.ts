import {ProfileScreenProps} from '../../../types/screen.props';
import {useContext, useEffect, useState} from 'react';
import {
  ACCEPT_FRIEND_REQUEST,
  FETCH_OPENED_USER,
  REJECT_FRIEND_REQUEST,
  REMOVE_FRIEND,
  SEND_FRIEND_REQUEST,
  SERVER_URL,
} from '@env';
import {IUser} from '../../../interfaces/user.interface';
import {UserContext} from '../../../Context';

const useProfile = ({route}: ProfileScreenProps) => {
  const {openedUserId} = route.params;
  const [openedUser, setOpenedUser] = useState<IUser>();
  const {
    authenticatedUser,
    setAuthenticatedUser,
    setReceivedRequests,
    setSentRequests,
    setFriends,
  } = useContext(UserContext);

  useEffect(() => {
    const handleFetchOpenedUser = async () => {
      const fetchOpenedUserUrl: string = `${SERVER_URL}${FETCH_OPENED_USER}`;
      const response = await fetch(fetchOpenedUserUrl, {
        method: 'POST',
        headers: {
          'Content-type': 'Application/json',
        },
        body: JSON.stringify({
          openedUserId,
        }),
      }).then(res => res.json());
      setOpenedUser(response.openedUser);
    };
    handleFetchOpenedUser();
  }, []);

  const handleSendFriendRequest = async (openedUser: IUser) => {
    const sendFriendRequestUrl: string = `${SERVER_URL}${SEND_FRIEND_REQUEST}`;
    const response = await fetch(sendFriendRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userToRequestId: openedUser._id,
      }),
    }).then(res => res.json());

    setAuthenticatedUser(prevUser => ({
      ...prevUser,
      sentFriendRequests: [...prevUser.sentFriendRequests, openedUser._id],
    }));

    setSentRequests(prevRequests => [...prevRequests, openedUser]);

    if (openedUser) {
      setOpenedUser(prevUser => {
        if (!prevUser) return prevUser;

        return {
          ...prevUser,
          receivedFriendRequests: [
            ...(prevUser.receivedFriendRequests || []),
            authenticatedUser._id,
          ],
        };
      });
    }
  };

  const handleAcceptFriendRequest = async (openedUser: IUser) => {
    const acceptFriendRequestUrl: string = `${SERVER_URL}${ACCEPT_FRIEND_REQUEST}`;
    const response = await fetch(acceptFriendRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userSendingId: openedUser._id,
      }),
    }).then(res => res.json());

    setAuthenticatedUser((user: IUser) => {
      let {receivedFriendRequests, friends} = user;

      return {
        ...user,
        receivedFriendRequests: receivedFriendRequests.filter(
          requested => requested !== openedUser._id,
        ),
        friends: [...friends, openedUser._id],
      };
    });
    setOpenedUser(prevUser => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        sentFriendRequests: prevUser.sentFriendRequests.filter(
          requested => requested !== authenticatedUser._id,
        ),
        friends: [...prevUser.friends, authenticatedUser._id],
      };
    });
    setFriends(prevFriends =>
      openedUser ? [...prevFriends, openedUser] : prevFriends,
    );
    setReceivedRequests(prevRequests =>
      prevRequests.filter(request => request !== openedUser),
    );
  };

  const handleRejectFriendRequest = async (openedUser: IUser) => {
    const RejectFriendRequestUrl: string = `${SERVER_URL}${REJECT_FRIEND_REQUEST}`;
    const response = await fetch(RejectFriendRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userSendingId: openedUser._id,
      }),
    }).then(res => res.json());
    setAuthenticatedUser(user => {
      let {receivedFriendRequests} = user;

      return {
        ...user,
        receivedFriendRequests: receivedFriendRequests.filter(
          requested => requested !== openedUser._id,
        ),
      };
    });
    setOpenedUser(prevUser => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        sentFriendRequests: prevUser.sentFriendRequests.filter(
          requested => requested !== authenticatedUser._id,
        ),
      };
    });
    setReceivedRequests(prevRequests =>
      prevRequests.filter(request => request !== openedUser),
    );
  };

  const handleRemoveFriend = async (openedUser: IUser) => {
    const removeFriendUrl: string = `${SERVER_URL}${REMOVE_FRIEND}`;
    const response = await fetch(removeFriendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currUserId: authenticatedUser._id,
        userToRemoveId: openedUser._id,
      }),
    }).then(res => res.json());
    setAuthenticatedUser(user => {
      let {friends} = user;

      return {
        ...user,
        friends: friends.filter(friend => friend !== openedUser._id),
      };
    });

    setOpenedUser(prevUser => {
      if (!prevUser) return prevUser;

      return {
        ...prevUser,
        friends: prevUser.friends.filter(
          friend => friend !== authenticatedUser._id,
        ),
      };
    });
    setFriends(prevFriends =>
      prevFriends.filter(friend => friend !== openedUser),
    );
  };

  return {
    openedUser,
    handleSendFriendRequest,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleRemoveFriend,
  };
};

export {useProfile};
