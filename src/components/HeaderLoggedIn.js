import React, { useEffect,useContext } from "react"
import {Link} from  "react-router-dom"
import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext";
import ReactTooltip from "react-tooltip";


function HeaderLoggedIn(props) {

  const appDispatch=useContext(DispatchContext);
  const appState=useContext(StateContext);
  function handleLogout()
  {
    appDispatch({type:"logout"})
    appDispatch({type:"flashMessage",value:"You have been succesfully logged out"});
  }
  function handleSearchIcon(e)
  {
    e.preventDefault()
    appDispatch({type:"openSearch"})
  }

  return (
    <div className="flex-row my-3 my-md-0">
          <a data-tip="Search" data-for="search" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
            <i className="fas fa-search"></i>
          </a>
          <ReactTooltip id="search" place="bottom" className="custom-tooltip" />{" "}
          <span onClick={()=>appDispatch({type:"toggleChat"})} data-tip="Chat" data-for="chat" className={"mr-2 header-chat-icon "+ (appState.unreadChatCount ? "text-danger" : "text-white")}>
            <i className="fas fa-comment"></i>
            {appState.unreadChatCount ? <span className="chat-count-badge text-white">{appState.unreadChatCount<10? appState.unreadChatCount : "9+" }</span> : "" }
          </span>
          <ReactTooltip id="chat" place="bottom" className="custom-tooltip" />{" "}
          <Link data-for="profile" data-tip="Profile" to={`/profile/${appState.user.username}`} className="mr-2">
            <img className="small-header-avatar" src={appState.user.avatar} />
          </Link>
          <ReactTooltip id="profile" place="bottom" className="custom-tooltip" />{" "}
          <Link className="btn btn-sm btn-success mr-2" to="/create-post">
            Create Post
          </Link>{" "}
            <button onClick={handleLogout} className="btn btn-sm btn-secondary">
              Sign Out
            </button>
    </div>
    )
}

export default HeaderLoggedIn