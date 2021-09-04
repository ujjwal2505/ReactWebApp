import React, { useContext, useEffect, useState } from "react";
import Page from "./Page";
import { useParams, NavLink, Route, Switch } from "react-router-dom";
import Axios from "axios";
import StateContext from "../StateContext";
import ProfilePosts from "./ProfilePosts";
import ProfileFollow from "./ProfileFollow";
import { useImmer } from "use-immer";

function Profile() {
  const { username } = useParams();
  const appState = useContext(StateContext);
  const [state, setState] = useImmer({
    followingActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "....",
      profileAvatar:
        "https://gravatar.com/avatar/92d2e4fb069f43a877cef662c4f0c2f6?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" },
    },
  });
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();
    async function fetchData() {
      try {
        const response = await Axios.post(
          `/profile/${username}`,
          { token: appState.user.token },
          { cancelToken: ourRequest.token }
        );
        console.log(response.data);
        setState((draft) => {
          draft.profileData = response.data;
        });
      } catch (error) {
        if (Axios.isCancel(error)) {
          console.log("Cancel Request by axios");
        } else {
          console.log("There was an error");
        }
      }
    }
    fetchData();

    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  useEffect(() => {
    if (state.startFollowingRequestCount) {
      setState((draft) => {
        draft.followingActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followingCount++;
            draft.followingActionLoading = false;
          });
        } catch (error) {
          if (Axios.isCancel()) {
            console.log("Cancel Request by Axios");
          } else {
            console.log("Thir was an error");
          }
        }
      }

      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.startFollowingRequestCount]);

  useEffect(() => {
    if (state.stopFollowingRequestCount) {
      setState((draft) => {
        draft.followingActionLoading = true;
      });
      const ourRequest = Axios.CancelToken.source();
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            { token: appState.user.token },
            { cancelToken: ourRequest.token }
          );
          setState((draft) => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followingCount--;
            draft.followingActionLoading = false;
          });
        } catch (error) {
          if (Axios.isCancel()) {
            console.log("Cancel Request by Axios");
          } else {
            console.log("Thir was an error");
          }
        }
      }

      fetchData();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.stopFollowingRequestCount]);

  function startFollowing() {
    setState((draft) => {
      draft.startFollowingRequestCount++;
    });
  }

  function stopFollowing() {
    setState((draft) => {
      draft.stopFollowingRequestCount++;
    });
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} />{" "}
        {state.profileData.profileUsername}
        {appState.loggedIn &&
          !state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "...." && (
            <button
              onClick={startFollowing}
              disabled={state.followingActionLoading}
              className="btn btn-primary btn-sm ml-2"
            >
              Follow <i className="fas fa-user-plus"></i>
            </button>
          )}
        {appState.loggedIn &&
          state.profileData.isFollowing &&
          appState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != "...." && (
            <button
              onClick={stopFollowing}
              disabled={state.followingActionLoading}
              className="btn btn-danger btn-sm ml-2"
            >
              Stop Following <i className="fas fa-user-times"></i>
            </button>
          )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink
          exact
          to={`/profile/${state.profileData.profileUsername}`}
          className="nav-item nav-link"
        >
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/followers`}
          className="nav-item nav-link"
        >
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink
          to={`/profile/${state.profileData.profileUsername}/following`}
          className="nav-item nav-link"
        >
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>
      <Switch>
        <Route exact path="/profile/:username">
          <ProfilePosts />
        </Route>
        <Route path="/profile/:username/followers">
          <ProfileFollow action="followers" />
        </Route>
        <Route path="/profile/:username/following">
          <ProfileFollow action="following" />
        </Route>
      </Switch>
    </Page>
  );
}

export default Profile;
